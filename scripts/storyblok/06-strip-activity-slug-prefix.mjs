#!/usr/bin/env node
/**
 * 06-strip-activity-slug-prefix.mjs — drop the redundant `activities-` prefix from every
 * `resource_activity` story slug (folder `activity/`).
 *
 *   activity/activities-thought-diaries  →  activity/thought-diaries
 *   activity/activities-trust-mapping    →  activity/trust-mapping
 *    … (8 stories)
 *
 * WHY IT'S SAFE: internal links resolve from the live `full_slug` at fetch time, related
 * content / grounding / session refs are uuid-based, and backend resource progress keys on
 * `storyblokUuid` — none of which the slug touches. The route `app/[locale]/activity/[slug]`
 * regenerates from Storyblok's links API on the next deploy.
 *
 * NOT HANDLED (deliberately): old `/activity/activities-*` URLs and `?openacc=activities-*`
 * deep links 404 after this — no redirects are added. `public/sitemap.xml` is updated in the
 * same PR.
 *
 * Each story is renamed then republished (production serves `version: published`). Stories
 * carry no `translated_slugs` and no slug-bearing content fields, so the rename is a single
 * field change.
 *
 * Idempotent: a story whose slug has no `activities-` prefix is skipped.
 *
 * SAFETY
 *   · Dry-run by default. Nothing is written unless you pass BOTH --write and --yes.
 *   · Every run writes a manifest to .storyblok-provision/.
 *
 * USAGE
 *   node scripts/storyblok/06-strip-activity-slug-prefix.mjs                 # dry-run
 *   node scripts/storyblok/06-strip-activity-slug-prefix.mjs --write --yes   # apply + republish
 *
 * ENV (.env.local is auto-loaded): STORYBLOK_OAUTH_TOKEN, STORYBLOK_SPACE_ID,
 *   optional STORYBLOK_MAPI_BASE (default https://mapi.storyblok.com/v1, EU).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..', '..');
const OUT_DIR = path.join(REPO_ROOT, '.storyblok-provision');

const FOLDER = 'activity/';
const PREFIX = 'activities-';

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

async function listFolderStories() {
  const out = [];
  for (let page = 1; page < 20; page++) {
    const data = await mapi(
      'GET',
      `/stories?starts_with=${encodeURIComponent(FOLDER)}&per_page=100&page=${page}`,
    );
    const batch = data.stories || [];
    out.push(...batch.filter((s) => !s.is_folder));
    if (batch.length < 100) break;
  }
  return out;
}

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
    script: '06-strip-activity-slug-prefix',
    startedAt: new Date().toISOString(),
    mode: live ? 'write' : 'dry-run',
    stories: [], // { id, from, to, translatedSlugs, status }
  };

  console.log(
    `\nMode: ${live ? 'WRITE + PUBLISH' : 'DRY-RUN'} | space ${process.env.STORYBLOK_SPACE_ID}\n`,
  );

  const stories = await listFolderStories();
  console.log(`### ${FOLDER} (${stories.length} stories)\n`);

  for (const stub of stories) {
    const label = stub.full_slug;

    if (!stub.slug.startsWith(PREFIX)) {
      console.log(`  skip     ${label} — no "${PREFIX}" prefix`);
      manifest.stories.push({
        id: stub.id,
        from: stub.slug,
        to: stub.slug,
        status: 'skip-correct',
      });
      continue;
    }

    const newSlug = stub.slug.slice(PREFIX.length);
    const { story } = await mapi('GET', `/stories/${stub.id}`);

    // Guard: the migration assumed no localised slugs. Bail loudly if that ever changes.
    if (Array.isArray(story.translated_slugs) && story.translated_slugs.length) {
      throw new Error(
        `${label} carries translated_slugs — this script only renames the base slug. Aborting.`,
      );
    }

    const record = {
      id: story.id,
      from: story.slug,
      to: newSlug,
      status: 'planned',
    };

    if (!live) {
      console.log(`  plan     ${label} → ${FOLDER}${newSlug} + republish`);
      manifest.stories.push(record);
      continue;
    }

    await mapi('PUT', `/stories/${story.id}`, { story: { slug: newSlug } });
    // Republish from the just-saved draft (production serves version: published).
    const fresh = (await mapi('GET', `/stories/${story.id}`)).story;
    await mapi('PUT', `/stories/${story.id}?publish=1`, { story: { content: fresh.content } });

    console.log(`  renamed  ${label} → ${fresh.full_slug} (republished)`);
    manifest.stories.push({ ...record, status: 'renamed-published', newFullSlug: fresh.full_slug });
    await sleep(PACE_MS);
  }

  manifest.finishedAt = new Date().toISOString();
  const manifestPath = path.join(OUT_DIR, `06-strip-activity-slug-prefix.${stamp}.json`);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest → ${path.relative(REPO_ROOT, manifestPath)}`);

  const renamed = manifest.stories.filter((s) => s.status !== 'skip-correct');
  console.log(`\n${renamed.length} stor${renamed.length === 1 ? 'y' : 'ies'} to rename.`);
  if (!live) console.log('DRY-RUN — nothing was written. Re-run with --write --yes to apply.');
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}`);
  process.exit(1);
});
