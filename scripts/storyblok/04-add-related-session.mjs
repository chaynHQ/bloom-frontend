#!/usr/bin/env node
/**
 * 04-add-related-session.mjs
 *
 * Adds an optional `related_session` relation field to the resource blocks that didn't have one:
 *   · resource_audio
 *   · resource_single_video
 *   · resource_written
 *   · resource_activity
 *
 * `resource_short_video` already has it (a short is by definition a clip of a session, so there
 * it's required). Here the field is OPTIONAL — most audio/written/activity resources won't
 * excerpt a session. The frontend (`useStoryblokResourcePage`) reads it via `resolve_relations`
 * and, when set, renders a "watch the full session" link for signed-in visitors and the
 * "access the full session" sign-up card for logged-out ones.
 *
 * `resource_conversation` is intentionally skipped — it merges into `resource_audio` in step 7.
 * `resource_video` (the step-7 merge target) is skipped too; the migration plan dropped
 * `related_session` from it and reversing that is out of scope here.
 *
 * The field is inserted directly after `related_content` so the three `related_*` fields sit
 * together in the editor; trailing fields are re-sequenced.
 *
 * Idempotent: a block that already has `related_session` is reported as "skip".
 *
 * SAFETY
 *   · Dry-run by default. Nothing is written unless you pass BOTH --write and --yes.
 *   · Every modified component is snapshotted to .storyblok-provision/ before any PUT.
 *   · Every run writes a manifest (planned + performed changes, full payloads) you can diff.
 *
 * USAGE
 *   node scripts/storyblok/04-add-related-session.mjs                # dry-run
 *   node scripts/storyblok/04-add-related-session.mjs --write --yes  # apply
 *
 * ENV (.env.local is auto-loaded):
 *   STORYBLOK_OAUTH_TOKEN   Management API token (Personal access / OAuth), write scope.
 *   STORYBLOK_SPACE_ID      Numeric space id.
 *   STORYBLOK_MAPI_BASE     Optional. Default https://mapi.storyblok.com/v1 (EU).
 *   STORYBLOK_AUTH_SCHEME   Optional. Set to "bearer" to skip the raw-token attempt.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..', '..');
const OUT_DIR = path.join(REPO_ROOT, '.storyblok-provision');

const TARGET_COMPONENTS = [
  'resource_audio',
  'resource_single_video',
  'resource_written',
  'resource_activity',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PACE_MS = 350;

// ----------------------------- args & env ------------------------------

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
      const text = await res.text();
      const hint =
        res.status === 401
          ? '\n  → 401 means STORYBLOK_OAUTH_TOKEN is not a Management API token with access ' +
            'to this space, or STORYBLOK_SPACE_ID / region (STORYBLOK_MAPI_BASE) is wrong.'
          : '';
      throw new Error(`Storyblok ${method} ${route} → ${res.status}: ${text}${hint}`);
    }
    return res.status === 204 ? null : res.json();
  }
  throw new Error(`Storyblok ${method} ${route} → too many rate-limit retries`);
}

async function listComponents() {
  const out = [];
  for (let page = 1; page < 20; page++) {
    const data = await mapi('GET', `/components?per_page=100&page=${page}`);
    const batch = data.components || [];
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}

// ----------------------------- schema ------------------------------

const clone = (v) => JSON.parse(JSON.stringify(v));

// Mirrors resource_short_video.related_session, but optional and without a min — most of these
// resources don't excerpt a session.
const relatedSessionField = () => ({
  type: 'option',
  source: 'internal_stories',
  use_uuid: true,
  force_link_scope: false,
  restrict_content_types: true,
  component_whitelist: ['Session', 'session_iba'],
  filter_content_type: ['Session', 'session_iba', 'Course'],
  entry_appearance: 'card',
  allow_advanced_search: true,
  max_options: '1',
  required: false,
  translatable: true,
  default_value: '',
  display_name: 'Related Session or Course Introduction',
  description:
    'Optional. The session (or course introduction) this resource is drawn from. Signed-in ' +
    'visitors get a link through to it; logged-out visitors get a sign-up prompt in its place.',
});

// Insert `related_session` immediately after `related_content`, re-sequencing `pos`. Returns a
// cloned component to PUT, or null if the field is already present.
function planAddField(component) {
  if (component.schema.related_session) return null;

  const schema = clone(component.schema);
  const ordered = Object.entries(schema).sort((a, b) => (a[1].pos ?? 0) - (b[1].pos ?? 0));
  const anchor = ordered.findIndex(([name]) => name === 'related_content');
  const insertAt = anchor === -1 ? ordered.length : anchor + 1;
  ordered.splice(insertAt, 0, ['related_session', relatedSessionField()]);

  const rebuilt = {};
  ordered.forEach(([name, def], i) => {
    rebuilt[name] = { ...def, pos: i };
  });
  return { ...component, schema: rebuilt };
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
    script: '04-add-related-session',
    startedAt: new Date().toISOString(),
    mode: live ? 'write' : 'dry-run',
    space: process.env.STORYBLOK_SPACE_ID,
    components: { updated: [], skipped: [] },
    payloads: {},
  };

  console.log(`\nMode: ${live ? 'WRITE' : 'DRY-RUN'} | space ${process.env.STORYBLOK_SPACE_ID}\n`);

  const existing = await listComponents();
  const byName = Object.fromEntries(existing.map((c) => [c.name, c]));

  for (const name of TARGET_COMPONENTS) {
    if (!byName[name]) throw new Error(`component "${name}" not found in this space`);
  }

  const snapshot = { takenAt: new Date().toISOString(), components: {} };

  for (const name of TARGET_COMPONENTS) {
    // Re-fetch so we PUT back the current definition plus this one addition.
    const { component } = await mapi('GET', `/components/${byName[name].id}`);
    snapshot.components[name] = component;

    const updated = planAddField(component);
    if (!updated) {
      console.log(`  skip    ${name} (already has related_session)`);
      manifest.components.skipped.push(name);
      continue;
    }

    const payload = { component: updated };
    manifest.payloads[`PUT /components ${name}`] = payload;

    if (!live) {
      console.log(`  plan    ${name} (+related_session after related_content)`);
      manifest.components.updated.push({ name, planned: true });
      continue;
    }

    const res = await mapi('PUT', `/components/${byName[name].id}`, payload);
    console.log(`  done    ${name} (id ${res.component.id})`);
    manifest.components.updated.push({ name, id: res.component.id });
    await sleep(PACE_MS);
  }

  const snapPath = path.join(OUT_DIR, `04-add-related-session.snapshot.${stamp}.json`);
  fs.writeFileSync(snapPath, JSON.stringify(snapshot, null, 2));
  console.log(`\nSnapshot of source components → ${path.relative(REPO_ROOT, snapPath)}`);

  manifest.finishedAt = new Date().toISOString();
  const manifestPath = path.join(OUT_DIR, `04-add-related-session.${stamp}.json`);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Manifest → ${path.relative(REPO_ROOT, manifestPath)}`);

  if (!live) {
    console.log(
      '\nDRY-RUN — nothing was written. Review the manifest payloads, then re-run with --write --yes.',
    );
  } else {
    console.log('\nDone. Verify the field on each block in the Storyblok editor.');
  }
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}`);
  process.exit(1);
});
