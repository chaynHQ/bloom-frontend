#!/usr/bin/env node
/**
 * redesign-cutover.mjs — retire the pre-redesign `home` / `welcome/*` stories.
 *
 * NOT part of the resource-types migration (docs/resource-type-rename-plan.md) — this is the
 * epic-redesign (#1938) cutover. The redesigned pages have been live from parallel stories:
 *
 *   home              (component Welcome,      old)  →  DELETE
 *   home-redesign     (component home_page,    new)  →  rename slug → `home`
 *   welcome/badoo     (component Welcome,      old)  →  DELETE
 *   welcome/bumble    (component Welcome,      old)  →  DELETE
 *   welcome-redesign/badoo   (welcome_page,   new)  →  move into `welcome/`, keep slug
 *   welcome-redesign/bumble  (welcome_page,   new)  →  move into `welcome/`, keep slug
 *   welcome/fruitz    (Welcome, unpublished, retired — no redesign)  →  LEFT UNTOUCHED
 *
 * PRECONDITION — the transitional route deploy must be in production first:
 *   · app/[locale]/page.tsx           resolves `home-redesign` ?? `home` (home_page only)
 *   · app/[locale]/welcome/[partnerName]/page.tsx  resolves `welcome-redesign/<p>` ?? `welcome/<p>`
 *     and renders by `content.component`
 * With that deployed, every step below is gap-free: at each instant either the old or the new
 * slug resolves to a story the route can render.
 *
 * AFTER this runs + is verified: a cleanup PR sets `HOME_SLUG = 'home'`, drops the fallbacks,
 * removes `home-redesign` from `[slug]/page.tsx` excludePaths, deletes `StoryblokWelcomePage` +
 * its `welcome` registration in `lib/storyblok.ts`. The old `Welcome` Storyblok component can
 * only be deleted once `welcome/fruitz` is also resolved (still on it).
 *
 * RECOVERY: every touched story is snapshotted to .storyblok-provision/ before any write.
 * Idempotent: an already-moved/renamed/deleted target is skipped.
 *
 * SAFETY: dry-run by default; --write --yes to apply.
 *
 * USAGE
 *   node scripts/storyblok/redesign-cutover.mjs                # dry-run
 *   node scripts/storyblok/redesign-cutover.mjs --write --yes
 *
 * ENV (.env.local auto-loaded): STORYBLOK_OAUTH_TOKEN, STORYBLOK_SPACE_ID.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..', '..');
const OUT_DIR = path.join(REPO_ROOT, '.storyblok-provision');

const WELCOME_FOLDER_SLUG = 'welcome';
const REDESIGN_FOLDER_SLUG = 'welcome-redesign';
const PARTNERS = ['badoo', 'bumble']; // fruitz deliberately excluded

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PACE_MS = 350;

function parseArgs(argv) {
  const args = { write: false, yes: false };
  for (const a of argv) {
    if (a === '--write') args.write = true;
    else if (a === '--yes') args.yes = true;
    else if (a === '--dry-run') args.write = false;
    else if (a === '--help' || a === '-h') {
      console.log(
        fs
          .readFileSync(fileURLToPath(import.meta.url), 'utf8')
          .split('*/')[0]
          .slice(3),
      );
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${a}`);
      process.exit(1);
    }
  }
  return args;
}

function loadDotEnv() {
  const file = path.join(REPO_ROOT, '.env.local');
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    if (process.env[key] !== undefined) continue;
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

function required(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return v;
}

function mapiBase() {
  return (process.env.STORYBLOK_MAPI_BASE || 'https://mapi.storyblok.com/v1').replace(/\/$/, '');
}

let authPrefix = process.env.STORYBLOK_AUTH_SCHEME === 'bearer' ? 'Bearer ' : '';

async function mapi(method, route, body) {
  const token = required('STORYBLOK_OAUTH_TOKEN');
  const spaceId = required('STORYBLOK_SPACE_ID');
  const url = `${mapiBase()}/spaces/${spaceId}${route}`;
  const send = (prefix) =>
    fetch(url, {
      method,
      headers: { Authorization: `${prefix}${token}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });

  for (let attempt = 0; attempt < 6; attempt++) {
    let res = await send(authPrefix);
    if (res.status === 401 && authPrefix === '') {
      const alt = await send('Bearer ');
      if (alt.ok) {
        authPrefix = 'Bearer ';
        res = alt;
      }
    }
    if (res.status === 429) {
      await sleep(1000 * (attempt + 1));
      continue;
    }
    if (!res.ok)
      throw new Error(`Storyblok ${method} ${route} → ${res.status}: ${await res.text()}`);
    return res.status === 204 ? null : res.json();
  }
  throw new Error(`Storyblok ${method} ${route} → too many rate-limit retries`);
}

async function findBySlug(slug) {
  const data = await mapi('GET', `/stories?per_page=100&with_slug=${encodeURIComponent(slug)}`);
  return (data.stories || []).find((s) => s.full_slug === slug || s.slug === slug);
}

async function full(id) {
  return (await mapi('GET', `/stories/${id}`)).story;
}

async function republish(id) {
  const s = await full(id);
  await mapi('PUT', `/stories/${id}?publish=1`, { story: { content: s.content } });
  return s;
}

async function main() {
  loadDotEnv();
  const args = parseArgs(process.argv.slice(2));
  const live = args.write && args.yes;
  if (args.write && !args.yes) {
    console.error('--write requires --yes. Aborting.');
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const manifest = {
    script: 'redesign-cutover',
    startedAt: new Date().toISOString(),
    mode: live ? 'write' : 'dry-run',
    steps: [],
  };
  const snapshots = {};
  const log = (s) => console.log(`  ${s}`);
  const step = (action, detail) => manifest.steps.push({ action, detail, live });

  console.log(`\nMode: ${live ? 'WRITE' : 'DRY-RUN'} | space ${process.env.STORYBLOK_SPACE_ID}\n`);

  // ---------- resolve + guard everything up front ----------
  const homeRedesign = await findBySlug('home-redesign');
  const homeOld = await findBySlug('home');
  const welcomeFolder = await findBySlug(WELCOME_FOLDER_SLUG);
  const redesignFolder = await findBySlug(REDESIGN_FOLDER_SLUG);

  if (!homeRedesign && homeOld?.content?.component === 'home_page') {
    log('home-redesign already renamed → home. Skipping home step.');
  } else if (!homeRedesign) {
    throw new Error(
      'guard: no `home-redesign` story and `home` is not a home_page — cannot proceed.',
    );
  } else {
    const hr = await full(homeRedesign.id);
    if (hr.content.component !== 'home_page' || !hr.published) {
      throw new Error(
        `guard: home-redesign must be a published home_page (got ${hr.content.component}, published=${hr.published}).`,
      );
    }
    snapshots['home-redesign'] = hr;
  }
  if (homeOld) {
    const ho = await full(homeOld.id);
    if (ho.content.component === 'home_page') {
      // already the new story (renamed) — nothing to delete
    } else if (ho.content.component !== 'Welcome') {
      throw new Error(
        `guard: old \`home\` is component ${ho.content.component}, expected Welcome. Aborting.`,
      );
    } else {
      snapshots['home'] = ho;
    }
  }

  if (!welcomeFolder?.is_folder) throw new Error('guard: `welcome` folder not found.');
  snapshots['welcome-folder'] = await full(welcomeFolder.id);

  const partnerPlan = [];
  for (const p of PARTNERS) {
    const oldStory = await findBySlug(`${WELCOME_FOLDER_SLUG}/${p}`);
    const redesign = await findBySlug(`${REDESIGN_FOLDER_SLUG}/${p}`);
    const oldFull = oldStory ? await full(oldStory.id) : null;
    const redesignFull = redesign ? await full(redesign.id) : null;

    if (oldFull?.content?.component === 'welcome_page') {
      log(`welcome/${p} already the redesigned story. Skipping.`);
      continue;
    }
    if (!redesignFull) {
      if (oldFull)
        throw new Error(
          `guard: welcome-redesign/${p} missing but welcome/${p} still on ${oldFull.content.component}.`,
        );
      log(`welcome/${p}: nothing to do.`);
      continue;
    }
    if (redesignFull.content.component !== 'welcome_page' || !redesignFull.published) {
      throw new Error(
        `guard: welcome-redesign/${p} must be a published welcome_page (got ${redesignFull.content.component}, published=${redesignFull.published}).`,
      );
    }
    if (oldFull && oldFull.content.component !== 'Welcome') {
      throw new Error(
        `guard: welcome/${p} is component ${oldFull.content.component}, expected Welcome.`,
      );
    }
    if (oldFull) snapshots[`welcome/${p}`] = oldFull;
    snapshots[`welcome-redesign/${p}`] = redesignFull;
    partnerPlan.push({ p, oldId: oldFull?.id ?? null, redesignId: redesignFull.id });
  }

  fs.writeFileSync(
    path.join(OUT_DIR, `redesign-cutover.snapshot.${stamp}.json`),
    JSON.stringify(snapshots, null, 2),
  );
  log(`snapshot → .storyblok-provision/redesign-cutover.snapshot.${stamp}.json\n`);

  // ---------- home ----------
  if (snapshots['home']) {
    if (live) {
      await mapi('DELETE', `/stories/${snapshots['home'].id}`);
      await sleep(PACE_MS);
    }
    log(`${live ? 'deleted' : 'plan DELETE'}  old home (id ${snapshots['home'].id}, Welcome)`);
    step('delete', `home ${snapshots['home'].id}`);
  }
  if (snapshots['home-redesign']) {
    if (live) {
      await mapi('PUT', `/stories/${snapshots['home-redesign'].id}`, { story: { slug: 'home' } });
      await sleep(PACE_MS);
      await republish(snapshots['home-redesign'].id);
      await sleep(PACE_MS);
    }
    log(
      `${live ? 'renamed ' : 'plan RENAME'}  home-redesign → home (id ${snapshots['home-redesign'].id}) + publish`,
    );
    step('rename', `home-redesign→home ${snapshots['home-redesign'].id}`);
  }

  // ---------- welcome folder content types ----------
  const wf = snapshots['welcome-folder'];
  const ct = wf.content?.content_types;
  if (Array.isArray(ct) && !ct.includes('welcome_page')) {
    const next = [...ct, 'welcome_page'];
    if (live) {
      await mapi('PUT', `/stories/${wf.id}`, {
        story: { content: { ...wf.content, content_types: next } },
      });
      await sleep(PACE_MS);
    }
    log(`${live ? 'updated ' : 'plan'}  welcome folder content_types → [${next.join(', ')}]`);
    step('folder-content-types', next.join(','));
  }

  // ---------- welcome partners ----------
  for (const { p, oldId, redesignId } of partnerPlan) {
    if (oldId) {
      if (live) {
        await mapi('DELETE', `/stories/${oldId}`);
        await sleep(PACE_MS);
      }
      log(`${live ? 'deleted' : 'plan DELETE'}  old welcome/${p} (id ${oldId}, Welcome)`);
      step('delete', `welcome/${p} ${oldId}`);
    }
    if (live) {
      await mapi('PUT', `/stories/${redesignId}`, { story: { parent_id: wf.id, slug: p } });
      await sleep(PACE_MS);
      const moved = await republish(redesignId);
      log(
        `moved   welcome-redesign/${p} → ${moved ? '' : ''}welcome/${p} (id ${redesignId}) + publish`,
      );
    } else {
      log(`plan MOVE  welcome-redesign/${p} → welcome/${p} (id ${redesignId}) + publish`);
    }
    step('move', `welcome-redesign/${p}→welcome/${p} ${redesignId}`);
  }

  // ---------- empty redesign folder ----------
  if (redesignFolder?.is_folder) {
    const remaining =
      (await mapi('GET', `/stories?with_parent=${redesignFolder.id}&per_page=100`)).stories || [];
    const leftover = remaining.filter((s) => !s.is_folder);
    if (leftover.length === 0) {
      if (live) {
        await mapi('DELETE', `/stories/${redesignFolder.id}`);
      }
      log(
        `${live ? 'deleted' : 'plan DELETE'}  empty ${REDESIGN_FOLDER_SLUG}/ folder (id ${redesignFolder.id})`,
      );
      step('delete-folder', `${REDESIGN_FOLDER_SLUG} ${redesignFolder.id}`);
    } else {
      log(
        `kept    ${REDESIGN_FOLDER_SLUG}/ folder — still holds: ${leftover.map((s) => s.slug).join(', ')}`,
      );
    }
  }

  manifest.finishedAt = new Date().toISOString();
  fs.writeFileSync(
    path.join(OUT_DIR, `redesign-cutover.${stamp}.json`),
    JSON.stringify(manifest, null, 2),
  );
  console.log(`\nManifest → .storyblok-provision/redesign-cutover.${stamp}.json`);
  if (!live) console.log('DRY-RUN — nothing was written. Re-run with --write --yes.');
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}`);
  process.exit(1);
});
