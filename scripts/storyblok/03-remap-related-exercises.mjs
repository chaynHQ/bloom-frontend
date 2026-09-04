#!/usr/bin/env node
/**
 * 03-remap-related-exercises.mjs — Step 3 of the resource-types migration
 * (docs/resource-type-rename-plan.md).
 *
 * For every resource_short_video / resource_single_video / resource_conversation story whose
 * `related_exercises` includes a grounding-* accordion id, sets `related_grounding` to the
 * matching resource_grounding story uuids (looked up from step 2's manifest).
 *
 * GROUNDING ONLY, FOR NOW. `activity-*` ids in `related_exercises` are left untouched — the
 * live frontend's `related_content` renderer doesn't have a `resource_activity` case until the
 * step-6 deploy, so wiring them into `related_content` now would silently drop cards on
 * course/session/welcome carousels. They move in step 6's post-verify backfill
 * (03b-activities-to-related-content.ts).
 *
 * `related_exercises` is left in place on every story, untouched — the live frontend still
 * reads it (for the `activity-*` ids, and as the source of truth) until the step-6 deploy
 * switches `ResourceGroundingSection` over to `related_grounding`.
 *
 * WHY THIS IS SAFE WITHOUT THE STEP-1 BACKEND DEPLOY: the stories this touches are the
 * pre-existing resource_short_video / resource_single_video / resource_conversation ones —
 * components the CURRENTLY DEPLOYED backend webhook already recognises (unrelated to the
 * pending migration PR). Re-publishing them only adds an inert `related_grounding` field
 * nothing reads yet; category derivation for these components is unchanged.
 *
 * By default touched stories are RE-PUBLISHED (the plan's instruction — the added field must
 * reach production, which serves `version: published`, not draft). Pass --draft to update the
 * draft only.
 *
 * Idempotent: a story whose current `related_grounding` (as a uuid set) already matches the
 * computed target is skipped.
 *
 * SAFETY
 *   · Dry-run by default. Nothing is written unless you pass BOTH --write and --yes.
 *   · Every run writes a manifest to .storyblok-provision/.
 *
 * USAGE
 *   node scripts/storyblok/03-remap-related-exercises.mjs                  # dry-run
 *   node scripts/storyblok/03-remap-related-exercises.mjs --write --yes    # apply + publish
 *   node scripts/storyblok/03-remap-related-exercises.mjs --draft --write --yes  # draft only
 *   node scripts/storyblok/03-remap-related-exercises.mjs --manifest <path>       # pick a
 *       specific step-2 manifest instead of the newest 02-copy-exercise-content.*.json
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

function loadGroundingMap(manifestPath) {
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
    if (item.type !== 'resource_grounding') continue;
    if (!item.newUuid) {
      missingUuid.push(item.oldAccordionId);
      continue;
    }
    map[item.oldAccordionId] = item.newUuid;
  }
  if (missingUuid.length) {
    throw new Error(
      `manifest "${file}" has grounding item(s) with no newUuid (dry-run manifest? re-run 02 with --write --yes first): ${missingUuid.join(', ')}`,
    );
  }
  return { map, file };
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
  const { map: groundingIdToUuid, file: manifestUsed } = loadGroundingMap(args.manifest);
  console.log(
    `Grounding id → uuid map from ${path.relative(REPO_ROOT, manifestUsed)} (${Object.keys(groundingIdToUuid).length} ids)`,
  );

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const manifest = {
    script: '03-remap-related-exercises',
    startedAt: new Date().toISOString(),
    mode: live ? 'write' : 'dry-run',
    publish: !args.draft,
    sourceManifest: manifestUsed,
    stories: [], // { slug, component, matchedGroundingIds, relatedGroundingUuids, status }
  };

  console.log(
    `\nMode: ${live ? 'WRITE' : 'DRY-RUN'}${!args.draft ? ' + PUBLISH' : ' (draft only)'} | space ${process.env.STORYBLOK_SPACE_ID}\n`,
  );

  for (const component of SOURCE_COMPONENTS) {
    const list = await listStoriesByComponent(component);
    console.log(`### ${component} (${list.length} stories)`);

    for (const stub of list) {
      const { story } = await mapi('GET', `/stories/${stub.id}`);
      const exercises = story.content.related_exercises || [];
      const matched = exercises.filter((id) => id in groundingIdToUuid);
      if (!matched.length) continue;

      const targetUuids = [...new Set(matched.map((id) => groundingIdToUuid[id]))];
      const current = story.content.related_grounding || [];
      const alreadyCorrect =
        current.length === targetUuids.length && targetUuids.every((u) => current.includes(u));

      const label = `${story.full_slug} (${component})`;
      if (alreadyCorrect) {
        console.log(`  skip     ${label} — related_grounding already correct`);
        manifest.stories.push({
          slug: story.full_slug,
          component,
          matchedGroundingIds: matched,
          relatedGroundingUuids: targetUuids,
          status: 'skip-correct',
        });
        continue;
      }

      if (!live) {
        console.log(`  plan     ${label} — related_exercises → [${matched.join(', ')}]`);
        manifest.stories.push({
          slug: story.full_slug,
          component,
          matchedGroundingIds: matched,
          relatedGroundingUuids: targetUuids,
          status: 'planned',
        });
        continue;
      }

      // Minimal PUT body — content only, matching the pattern proven in this repo's other
      // Storyblok scripts. Sending the whole fetched story back risks read-only/computed
      // fields (id, uuid, full_slug, path, ...) confusing the API.
      const payload = { story: { content: { ...story.content, related_grounding: targetUuids } } };
      const route = args.draft ? `/stories/${story.id}` : `/stories/${story.id}?publish=1`;
      const res = await mapi('PUT', route, payload);
      console.log(`  updated  ${label}${args.draft ? '' : ' (republished)'}`);
      manifest.stories.push({
        slug: story.full_slug,
        component,
        matchedGroundingIds: matched,
        relatedGroundingUuids: targetUuids,
        status: args.draft ? 'updated-draft' : 'updated-published',
        storyId: res.story.id,
      });
      await sleep(PACE_MS);
    }
  }

  manifest.finishedAt = new Date().toISOString();
  const manifestPath = path.join(OUT_DIR, `03-remap-related-exercises.${stamp}.json`);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest → ${path.relative(REPO_ROOT, manifestPath)}`);

  const touched = manifest.stories.filter((s) => s.status !== 'skip-correct');
  console.log(
    `\n${touched.length} stor${touched.length === 1 ? 'y' : 'ies'} with a grounding reference to remap.`,
  );
  if (!live) {
    console.log('DRY-RUN — nothing was written. Re-run with --write --yes to apply.');
  }
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}`);
  process.exit(1);
});
