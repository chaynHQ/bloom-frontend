#!/usr/bin/env node
/**
 * 03b-activities-to-related-content.mjs — Step 6 post-verify of the resource-types migration
 * (docs/resource-type-rename-plan.md).
 *
 * Companion to 03-remap-related-exercises.mjs. That script moved the `grounding-*` ids out of
 * `related_exercises` into `related_grounding`. This one moves the `activity-*` ids into
 * `related_content` — appending the matching `resource_activity` story uuids (from step 2's
 * manifest) to each story's existing `related_content` list.
 *
 * WHY IT WAITS FOR THE STEP-6 DEPLOY: the live frontend's `related_content` renderer
 * (StoryblokRelatedContent / ResourceCarousel) had no `resource_activity` case until step 6.
 * Adding the refs earlier would silently drop cards. Run this only after the step-6 frontend
 * deploy is verified in production.
 *
 * SCOPE (full `related_exercises` scan 2026-09-09): 11 old stories carry `activity-*` refs —
 * 9 resource_short_video + 2 resource_conversation. No resource_single_video story has any.
 * The script scans all three components anyway.
 *
 * `related_content` is translatable: a story may carry per-locale `related_content__i18n__<loc>`
 * overrides. This script appends the new uuids to the base list AND to every override that
 * already exists (a locale with no override falls back to the base, which is updated). It never
 * creates a new override.
 *
 * `related_exercises` is left in place, untouched — step 8 removes the field.
 *
 * Idempotent: a story whose base list and every existing override already contain all target
 * uuids is skipped. Re-running after a partial failure is safe.
 *
 * SAFETY
 *   · Dry-run by default. Nothing is written unless you pass BOTH --write and --yes.
 *   · Re-published by default (production serves `version: published`); --draft to opt out.
 *   · Every run writes a manifest to .storyblok-provision/.
 *
 * USAGE
 *   node scripts/storyblok/03b-activities-to-related-content.mjs                 # dry-run
 *   node scripts/storyblok/03b-activities-to-related-content.mjs --write --yes   # apply + publish
 *   node scripts/storyblok/03b-activities-to-related-content.mjs --draft --write --yes
 *   node scripts/storyblok/03b-activities-to-related-content.mjs --manifest <path>
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

const SOURCE_COMPONENTS = [
  'resource_short_video',
  'resource_single_video',
  'resource_conversation',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PACE_MS = 350;

// ----------------------------- args & env ------------------------------

function parseArgs(argv) {
  const args = { write: false, yes: false, draft: false, manifest: undefined };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--write') args.write = true;
    else if (a === '--yes') args.yes = true;
    else if (a === '--dry-run') args.write = false;
    else if (a === '--draft') args.draft = true;
    else if (a === '--manifest') args.manifest = argv[++i];
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

async function listStoriesByComponent(component) {
  const out = [];
  for (let page = 1; page < 20; page++) {
    const data = await mapi(
      'GET',
      `/stories?filter_query[component][in]=${component}&per_page=100&page=${page}`,
    );
    const batch = data.stories || [];
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}

// ----------------------------- step-2 manifest ------------------------------

function loadActivityMap(manifestPath) {
  let file = manifestPath;
  if (!file) {
    const candidates = fs
      .readdirSync(OUT_DIR)
      .filter((f) => f.startsWith('02-copy-exercise-content.') && f.endsWith('.json'))
      .sort();
    if (!candidates.length) {
      throw new Error(
        `no 02-copy-exercise-content.*.json manifest found in ${path.relative(REPO_ROOT, OUT_DIR)}/ — run 02-copy-exercise-content.mjs first, or pass --manifest <path>`,
      );
    }
    file = path.join(OUT_DIR, candidates[candidates.length - 1]);
  }
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
  const map = {};
  const missingUuid = [];
  for (const item of manifest.items) {
    if (item.type !== 'resource_activity') continue;
    if (!item.newUuid) {
      missingUuid.push(item.oldAccordionId);
      continue;
    }
    map[item.oldAccordionId] = item.newUuid;
  }
  if (missingUuid.length) {
    throw new Error(
      `manifest "${file}" has activity item(s) with no newUuid (dry-run manifest? re-run 02 with --write --yes first): ${missingUuid.join(', ')}`,
    );
  }
  return { map, file };
}

// ----------------------------- append logic ------------------------------

// Keys on a story's content that hold a related_content list: the base plus any translatable
// overrides (related_content__i18n__de, ...).
function relatedContentKeys(content) {
  return Object.keys(content).filter(
    (k) => k === 'related_content' || k.startsWith('related_content__i18n__'),
  );
}

// Append `toAdd` uuids not already present; existing order preserved, new refs in manifest order.
function appendMissing(list, toAdd) {
  const current = Array.isArray(list) ? list : [];
  const missing = toAdd.filter((u) => !current.includes(u));
  return { next: [...current, ...missing], added: missing };
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
  const { map: activityIdToUuid, file: manifestUsed } = loadActivityMap(args.manifest);
  console.log(
    `Activity id → uuid map from ${path.relative(REPO_ROOT, manifestUsed)} (${Object.keys(activityIdToUuid).length} ids)`,
  );

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const manifest = {
    script: '03b-activities-to-related-content',
    startedAt: new Date().toISOString(),
    mode: live ? 'write' : 'dry-run',
    publish: !args.draft,
    sourceManifest: manifestUsed,
    stories: [], // { slug, component, matchedActivityIds, targetUuids, perKey, status }
  };

  console.log(
    `\nMode: ${live ? 'WRITE' : 'DRY-RUN'}${!args.draft ? ' + PUBLISH' : ' (draft only)'} | space ${process.env.STORYBLOK_SPACE_ID}\n`,
  );

  for (const component of SOURCE_COMPONENTS) {
    const list = await listStoriesByComponent(component);
    console.log(`### ${component} (${list.length} stories)`);

    for (const stub of list) {
      const { story } = await mapi('GET', `/stories/${stub.id}`);
      const content = story.content;
      const exercises = content.related_exercises || [];
      const matched = exercises.filter((id) => id in activityIdToUuid);
      if (!matched.length) continue;

      const targetUuids = [...new Set(matched.map((id) => activityIdToUuid[id]))];
      const label = `${story.full_slug} (${component})`;

      const keys = relatedContentKeys(content);
      // Ensure the base key is always considered even if the story has none set yet.
      if (!keys.includes('related_content')) keys.unshift('related_content');

      const perKey = [];
      const nextContent = { ...content };
      for (const key of keys) {
        const { next, added } = appendMissing(content[key], targetUuids);
        perKey.push({ key, added, resultLength: next.length });
        nextContent[key] = next;
      }

      const anyChange = perKey.some((k) => k.added.length > 0);
      if (!anyChange) {
        console.log(`  skip     ${label} — related_content already has the activity refs`);
        manifest.stories.push({
          slug: story.full_slug,
          component,
          matchedActivityIds: matched,
          targetUuids,
          perKey,
          status: 'skip-correct',
        });
        continue;
      }

      if (!live) {
        console.log(
          `  plan     ${label} — append [${targetUuids.join(', ')}] to ${perKey
            .filter((k) => k.added.length)
            .map((k) => k.key)
            .join(', ')}`,
        );
        manifest.stories.push({
          slug: story.full_slug,
          component,
          matchedActivityIds: matched,
          targetUuids,
          perKey,
          status: 'planned',
        });
        continue;
      }

      // Minimal PUT body — content only, matching this repo's other Storyblok scripts.
      const payload = { story: { content: nextContent } };
      const route = args.draft ? `/stories/${story.id}` : `/stories/${story.id}?publish=1`;
      const res = await mapi('PUT', route, payload);
      console.log(`  updated  ${label}${args.draft ? '' : ' (republished)'}`);
      manifest.stories.push({
        slug: story.full_slug,
        component,
        matchedActivityIds: matched,
        targetUuids,
        perKey,
        status: args.draft ? 'updated-draft' : 'updated-published',
        storyId: res.story.id,
      });
      await sleep(PACE_MS);
    }
  }

  manifest.finishedAt = new Date().toISOString();
  const manifestPath = path.join(OUT_DIR, `03b-activities-to-related-content.${stamp}.json`);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest → ${path.relative(REPO_ROOT, manifestPath)}`);

  const touched = manifest.stories.filter((s) => s.status !== 'skip-correct');
  console.log(
    `\n${touched.length} stor${touched.length === 1 ? 'y' : 'ies'} with an activity reference to backfill.`,
  );
  if (!live) {
    console.log('DRY-RUN — nothing was written. Re-run with --write --yes to apply.');
  }
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}`);
  process.exit(1);
});
