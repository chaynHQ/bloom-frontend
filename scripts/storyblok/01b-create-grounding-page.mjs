#!/usr/bin/env node
/**
 * 01b-create-grounding-page.mjs — resource-types migration (docs/resource-type-rename-plan.md).
 *
 * Creates the `grounding_page` content type: the Storyblok page for the `/grounding` landing
 * route (hero copy + SEO), rendered by `components/storyblok/StoryblokGrounding.tsx`. The
 * grounding exercise cards themselves stay as `resource_grounding` stories in the folder; this
 * component is only the page around them.
 *
 * Schema = the space's standard page fields, cloned from the `page` component:
 *   title (text, required, translatable) · seo_description (text, translatable) ·
 *   description (richtext, required, translatable) · header_image (asset, translatable).
 * No `page_sections` — the grounding page layout is fixed in code.
 *
 * ADDITIVE + SAFE TO RUN NOW: a new component nothing references yet. Step 6 moves the existing
 * flat `grounding` story onto this component (04-delete-flat-pages.mjs).
 *
 * Idempotent: skips if `grounding_page` already exists (pass --converge to PUT the schema back
 * onto an existing component — additive field-by-field, never removing).
 *
 * SAFETY: dry-run by default; --write --yes to apply. Manifest to .storyblok-provision/.
 *
 * USAGE
 *   node scripts/storyblok/01b-create-grounding-page.mjs                 # dry-run
 *   node scripts/storyblok/01b-create-grounding-page.mjs --write --yes   # create
 *   node scripts/storyblok/01b-create-grounding-page.mjs --converge --write --yes
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

const PAGES_GROUP_UUID = '1188f7f4-5755-45f6-9efd-59be3905a022';
const COMPONENT_NAME = 'grounding_page';
const FIELDS_FROM_PAGE = ['title', 'seo_description', 'description', 'header_image'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ----------------------------- args & env ------------------------------

function parseArgs(argv) {
  const args = { write: false, yes: false, converge: false };
  for (const a of argv) {
    if (a === '--write') args.write = true;
    else if (a === '--yes') args.yes = true;
    else if (a === '--dry-run') args.write = false;
    else if (a === '--converge') args.converge = true;
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

async function listComponents() {
  const out = [];
  for (let page = 1; page < 10; page++) {
    const data = await mapi('GET', `/components?per_page=100&page=${page}`);
    const batch = data.components || [];
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}

// ----------------------------- schema ------------------------------

const clone = (v) => JSON.parse(JSON.stringify(v));

function buildSchema(pageSchema) {
  const schema = {};
  FIELDS_FROM_PAGE.forEach((key, i) => {
    const src = pageSchema[key];
    if (!src) throw new Error(`source \`page\` component has no field "${key}"`);
    const f = clone(src);
    delete f.id;
    schema[key] = { ...f, pos: i, translatable: true };
  });
  // The grounding page hero image is decorative; don't force editors to set one.
  if (schema.header_image) schema.header_image.required = false;
  return schema;
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

  const components = await listComponents();
  const page = components.find((c) => c.name === 'page');
  if (!page) throw new Error('no `page` component to clone standard fields from');
  const existing = components.find((c) => c.name === COMPONENT_NAME);

  const schema = buildSchema(page.schema);
  const manifest = {
    script: '01b-create-grounding-page',
    startedAt: new Date().toISOString(),
    mode: live ? 'write' : 'dry-run',
    action: null,
    schemaKeys: Object.keys(schema),
  };

  console.log(`\nMode: ${live ? 'WRITE' : 'DRY-RUN'} | space ${process.env.STORYBLOK_SPACE_ID}\n`);

  if (existing && !args.converge) {
    console.log(
      `  skip     component "${COMPONENT_NAME}" already exists (id ${existing.id}). --converge to update.`,
    );
    manifest.action = 'skip-exists';
  } else if (existing && args.converge) {
    const merged = clone(existing);
    let changed = false;
    let pos = Math.max(-1, ...Object.values(merged.schema).map((f) => f.pos ?? 0));
    for (const [key, def] of Object.entries(schema)) {
      if (!merged.schema[key]) {
        merged.schema[key] = { ...def, pos: ++pos };
        changed = true;
        console.log(`  converge add field ${key}`);
      }
    }
    if (!changed) {
      console.log(`  skip     component "${COMPONENT_NAME}" already has every standard field`);
      manifest.action = 'skip-converged';
    } else if (live) {
      await mapi('PUT', `/components/${existing.id}`, { component: merged });
      console.log(`  updated  component "${COMPONENT_NAME}" (id ${existing.id})`);
      manifest.action = 'converged';
    } else {
      console.log(`  plan     PUT component "${COMPONENT_NAME}" — add missing standard fields`);
      manifest.action = 'plan-converge';
    }
  } else {
    const payload = {
      component: {
        name: COMPONENT_NAME,
        display_name: 'Grounding page',
        is_root: true,
        is_nestable: false,
        component_group_uuid: PAGES_GROUP_UUID,
        schema,
      },
    };
    manifest.payload = payload;
    if (live) {
      const res = await mapi('POST', '/components', payload);
      console.log(`  created  component "${COMPONENT_NAME}" (id ${res.component.id})`);
      manifest.action = 'created';
      manifest.componentId = res.component.id;
    } else {
      console.log(
        `  plan     POST component "${COMPONENT_NAME}" (${Object.keys(schema).length} fields, Pages group)`,
      );
      manifest.action = 'plan-create';
    }
  }

  manifest.finishedAt = new Date().toISOString();
  const manifestPath = path.join(OUT_DIR, `01b-create-grounding-page.${stamp}.json`);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest → ${path.relative(REPO_ROOT, manifestPath)}`);
  if (!live) console.log('DRY-RUN — nothing was written. Re-run with --write --yes to apply.');
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}`);
  process.exit(1);
});
