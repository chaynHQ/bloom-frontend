#!/usr/bin/env node
/**
 * 04-delete-flat-pages.mjs — Step 6 post-verify of the resource-types migration
 * (docs/resource-type-rename-plan.md).
 *
 * Finalises the grounding + activities restructure. Four actions, in this order:
 *
 *   1. DELETE the flat `activities` story (component: page). Its 8 accordion items were copied
 *      to `resource_activity` stories in step 2; `/activities` now 301s to the library.
 *
 *   2. DELETE the flat `grounding` story (component: page). Its hero copy was copied to the
 *      `grounding_page` story `grounding-exercises/overview` by 02b-create-grounding-page-story.mjs
 *      (verified present before the delete); its accordion items are the `resource_grounding`
 *      stories from step 2.
 *
 *   3. RENAME the folder slug `grounding-exercises` → `grounding`. Freed by (2). The page story
 *      becomes `grounding/overview` — what `app/[locale]/grounding/page.tsx` fetches. Transparent
 *      to the app (component filter + leaf-slug `?id=`; uuid refs).
 *
 *   4. PUBLISH `grounding/overview` (it was created as a draft). Child `resource_grounding`
 *      stories are only re-published with --republish-children (the app doesn't use the folder
 *      path).
 *
 * The frontend must already be deployed with `StoryblokGrounding` + the `grounding/overview`
 * fetch (it falls back to the flat `grounding` story until this runs, so the order is safe
 * either way, but run this only after that deploy is verified in production).
 *
 * RECOVERY: full pre-change story objects are snapshotted to
 *   .storyblok-provision/04-delete-flat-pages.snapshot.<stamp>.json before any write.
 *
 * Idempotent: a missing flat story is skipped; a folder already slugged `grounding` is left
 * alone; an already-published `overview` is skipped.
 *
 * SAFETY
 *   · Dry-run by default. Writes need --write --yes.
 *   · Guards: the flat stories must be `is_folder:false` + `component:page`; the folder must be
 *     `is_folder:true`; the `grounding_page` `overview` story must already exist and carry a
 *     non-empty `title` (so the hero survives the flat-page delete).
 *
 * USAGE
 *   node scripts/storyblok/04-delete-flat-pages.mjs                              # dry-run
 *   node scripts/storyblok/04-delete-flat-pages.mjs --write --yes
 *   node scripts/storyblok/04-delete-flat-pages.mjs --write --yes --republish-children
 *
 * ENV (.env.local auto-loaded): STORYBLOK_OAUTH_TOKEN, STORYBLOK_SPACE_ID,
 *   optional STORYBLOK_MAPI_BASE (default https://mapi.storyblok.com/v1, EU).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..', '..');
const OUT_DIR = path.join(REPO_ROOT, '.storyblok-provision');

const FLAT_PAGE_SLUGS = ['activities', 'grounding'];
const FOLDER_OLD_SLUG = 'grounding-exercises';
const FOLDER_NEW_SLUG = 'grounding';
const PAGE_SLUG = 'overview';
const GROUNDING_PAGE_COMPONENT = 'grounding_page';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PACE_MS = 350;

// ----------------------------- args & env ------------------------------

function parseArgs(argv) {
  const args = { write: false, yes: false, republishChildren: false };
  for (const a of argv) {
    if (a === '--write') args.write = true;
    else if (a === '--yes') args.yes = true;
    else if (a === '--dry-run') args.write = false;
    else if (a === '--republish-children') args.republishChildren = true;
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

// ----------------------------- Storyblok Management API ------------------------------

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
    if (!res.ok) {
      throw new Error(`Storyblok ${method} ${route} → ${res.status}: ${await res.text()}`);
    }
    return res.status === 204 ? null : res.json();
  }
  throw new Error(`Storyblok ${method} ${route} → too many rate-limit retries`);
}

async function findBySlugAnywhere(slug) {
  const data = await mapi('GET', `/stories?per_page=100&with_slug=${encodeURIComponent(slug)}`);
  return (data.stories || []).find((s) => s.full_slug === slug || s.slug === slug);
}

async function listChildren(folderId) {
  const out = [];
  for (let page = 1; page < 20; page++) {
    const data = await mapi('GET', `/stories?per_page=100&page=${page}&with_parent=${folderId}`);
    const batch = data.stories || [];
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}

// ----------------------------- run ------------------------------

async function main() {
  loadDotEnv();
  const args = parseArgs(process.argv.slice(2));
  const live = args.write && args.yes;
  if (args.write && !args.yes) {
    console.error('--write requires --yes (safety confirmation). Aborting.');
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const manifest = {
    script: '04-delete-flat-pages',
    startedAt: new Date().toISOString(),
    mode: live ? 'write' : 'dry-run',
    deletes: [],
    folderRename: null,
    publishOverview: null,
    republish: [],
  };
  const snapshots = {};

  console.log(`\nMode: ${live ? 'WRITE' : 'DRY-RUN'} | space ${process.env.STORYBLOK_SPACE_ID}\n`);

  // ---- guard: the grounding_page `overview` story must exist with a hero title ------
  const overview =
    (await findBySlugAnywhere(`${FOLDER_OLD_SLUG}/${PAGE_SLUG}`)) ||
    (await findBySlugAnywhere(`${FOLDER_NEW_SLUG}/${PAGE_SLUG}`));
  if (!overview) {
    throw new Error(
      `guard: no "${PAGE_SLUG}" story in the grounding folder — run 02b-create-grounding-page-story.mjs first.`,
    );
  }
  const { story: overviewFull } = await mapi('GET', `/stories/${overview.id}`);
  if (
    overviewFull.content?.component !== GROUNDING_PAGE_COMPONENT ||
    !String(overviewFull.content?.title || '').trim()
  ) {
    throw new Error(
      `guard: "${overviewFull.full_slug}" is not a ${GROUNDING_PAGE_COMPONENT} with a non-empty title — the hero would be lost. Aborting.`,
    );
  }
  snapshots.overview = overviewFull;
  console.log(
    `  ok       hero page "${overviewFull.full_slug}" present (title: "${overviewFull.content.title}")`,
  );

  // ---- 1 + 2. delete the flat pages -------------------------------------------------
  for (const slug of FLAT_PAGE_SLUGS) {
    const stub = await findBySlugAnywhere(slug);
    if (!stub) {
      console.log(`  skip     flat "${slug}" — not found (already deleted?)`);
      manifest.deletes.push({ slug, id: null, status: 'not-found' });
      continue;
    }
    const { story } = await mapi('GET', `/stories/${stub.id}`);
    if (story.is_folder || story.content?.component !== 'page') {
      throw new Error(
        `guard: "${slug}" (id ${story.id}) is not a flat page — is_folder=${story.is_folder}, component=${story.content?.component}.`,
      );
    }
    snapshots[slug] = story;
    if (!live) {
      console.log(`  plan     DELETE flat "${story.full_slug}" (id ${story.id})`);
      manifest.deletes.push({ slug, id: story.id, status: 'planned' });
      continue;
    }
    await mapi('DELETE', `/stories/${story.id}`);
    console.log(`  deleted  flat "${story.full_slug}" (id ${story.id})`);
    manifest.deletes.push({ slug, id: story.id, status: 'deleted' });
    await sleep(PACE_MS);
  }

  const snapPath = path.join(OUT_DIR, `04-delete-flat-pages.snapshot.${stamp}.json`);
  fs.writeFileSync(snapPath, JSON.stringify(snapshots, null, 2));
  console.log(`\n  Snapshot → ${path.relative(REPO_ROOT, snapPath)}`);

  // ---- 3. rename the folder ---------------------------------------------------
  const newFolder = await findBySlugAnywhere(FOLDER_NEW_SLUG);
  if (newFolder && newFolder.is_folder) {
    console.log(`  skip     folder rename — "${FOLDER_NEW_SLUG}/" already exists`);
    manifest.folderRename = { id: newFolder.id, to: FOLDER_NEW_SLUG, status: 'already-renamed' };
  } else {
    const oldFolder = await findBySlugAnywhere(FOLDER_OLD_SLUG);
    if (!oldFolder)
      throw new Error(`guard: no folder "${FOLDER_OLD_SLUG}" and none "${FOLDER_NEW_SLUG}".`);
    const { story: folder } = await mapi('GET', `/stories/${oldFolder.id}`);
    if (!folder.is_folder)
      throw new Error(`guard: "${FOLDER_OLD_SLUG}" (id ${folder.id}) is not a folder.`);
    if (!live) {
      console.log(
        `  plan     RENAME folder id ${folder.id}: "${folder.slug}" → "${FOLDER_NEW_SLUG}"`,
      );
      manifest.folderRename = {
        id: folder.id,
        from: folder.slug,
        to: FOLDER_NEW_SLUG,
        status: 'planned',
      };
    } else {
      await mapi('PUT', `/stories/${folder.id}`, { story: { slug: FOLDER_NEW_SLUG } });
      console.log(`  renamed  folder id ${folder.id}: "${folder.slug}" → "${FOLDER_NEW_SLUG}"`);
      manifest.folderRename = {
        id: folder.id,
        from: folder.slug,
        to: FOLDER_NEW_SLUG,
        status: 'renamed',
      };
      await sleep(PACE_MS);
    }
  }

  // ---- 4. publish grounding/overview -----------------------------------------------
  if (overviewFull.published && !overviewFull.unpublished_changes) {
    console.log(`  skip     "${overviewFull.full_slug}" already published`);
    manifest.publishOverview = { id: overviewFull.id, status: 'already-published' };
  } else if (!live) {
    console.log(`  plan     PUBLISH "${FOLDER_NEW_SLUG}/${PAGE_SLUG}" (id ${overviewFull.id})`);
    manifest.publishOverview = { id: overviewFull.id, status: 'planned' };
  } else {
    const { story: fresh } = await mapi('GET', `/stories/${overviewFull.id}`);
    await mapi('PUT', `/stories/${overviewFull.id}?publish=1`, {
      story: { content: fresh.content },
    });
    console.log(`  published "${FOLDER_NEW_SLUG}/${PAGE_SLUG}" (id ${overviewFull.id})`);
    manifest.publishOverview = { id: overviewFull.id, status: 'published' };
    await sleep(PACE_MS);
  }

  // ---- optional: re-publish children ---------------------------------------------
  if (args.republishChildren) {
    const folderId = manifest.folderRename?.id;
    const children = folderId ? await listChildren(folderId) : [];
    const published = children.filter((c) => !c.is_folder && c.published && c.slug !== PAGE_SLUG);
    console.log(
      `\n  ${published.length}/${children.length} child stor${published.length === 1 ? 'y' : 'ies'} published — re-publishing for the new folder path`,
    );
    for (const child of published) {
      if (!live) {
        console.log(`  plan     republish ${child.slug} (id ${child.id})`);
        manifest.republish.push({ slug: child.slug, id: child.id, status: 'planned' });
        continue;
      }
      const { story: fresh } = await mapi('GET', `/stories/${child.id}`);
      await mapi('PUT', `/stories/${child.id}?publish=1`, { story: { content: fresh.content } });
      console.log(`  republished ${child.slug} (id ${child.id})`);
      manifest.republish.push({ slug: child.slug, id: child.id, status: 'republished' });
      await sleep(PACE_MS);
    }
  }

  manifest.finishedAt = new Date().toISOString();
  const manifestPath = path.join(OUT_DIR, `04-delete-flat-pages.${stamp}.json`);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest → ${path.relative(REPO_ROOT, manifestPath)}`);
  if (!live) console.log('DRY-RUN — nothing was written. Re-run with --write --yes.');
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}`);
  process.exit(1);
});
