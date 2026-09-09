#!/usr/bin/env node
/**
 * 02b-create-grounding-page-story.mjs — resource-types migration
 * (docs/resource-type-rename-plan.md).
 *
 * Creates the grounding landing-page STORY on the `grounding_page` component
 * (01b-create-grounding-page.mjs), copying the hero fields from the flat `grounding` page:
 * `title`, `seo_description`, `description`, `header_image` + every `__i18n__<locale>` variant.
 * The old `page_sections` accordion is NOT copied — those items are the `resource_grounding`
 * stories from step 2.
 *
 * The story is created at `grounding-exercises/overview` (the folder is still
 * `grounding-exercises/` at this point). Step 6's `04-delete-flat-pages.mjs` renames the folder
 * → `grounding/`, so it becomes `grounding/overview` — which is what
 * `app/[locale]/grounding/page.tsx` fetches (with a fallback to the flat `grounding` story
 * until then).
 *
 * ADDITIVE + SAFE TO RUN NOW: a new story in a folder the running frontend doesn't query by
 * path; `grounding_page` produces no backend `resource` row (webhook ignores it, like
 * `resource_grounding`). Created as a DRAFT by default — pass --publish once you're happy with
 * the hero copy (or let `04` publish it at step 6).
 *
 * Idempotent: skips if an `overview` story already exists in the grounding folder (old or new
 * slug). Pass --update to overwrite its hero fields from the flat page again.
 *
 * SAFETY: dry-run by default; --write --yes to apply. Snapshot + manifest to
 * .storyblok-provision/.
 *
 * USAGE
 *   node scripts/storyblok/02b-create-grounding-page-story.mjs                    # dry-run
 *   node scripts/storyblok/02b-create-grounding-page-story.mjs --write --yes      # create draft
 *   node scripts/storyblok/02b-create-grounding-page-story.mjs --write --yes --publish
 *   node scripts/storyblok/02b-create-grounding-page-story.mjs --write --yes --update
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

const FLAT_GROUNDING_SLUG = 'grounding';
const FOLDER_OLD_SLUG = 'grounding-exercises';
const FOLDER_NEW_SLUG = 'grounding';
const PAGE_SLUG = 'overview';
const PAGE_NAME = 'Grounding';
const COMPONENT = 'grounding_page';
const HERO_FIELDS = ['title', 'seo_description', 'description', 'header_image'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ----------------------------- args & env ------------------------------

function parseArgs(argv) {
  const args = { write: false, yes: false, publish: false, update: false };
  for (const a of argv) {
    if (a === '--write') args.write = true;
    else if (a === '--yes') args.yes = true;
    else if (a === '--dry-run') args.write = false;
    else if (a === '--publish') args.publish = true;
    else if (a === '--update') args.update = true;
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

// title, title__i18n__de, seo_description, seo_description__i18n__fr, ... — the hero fields and
// all their locale variants.
function pickHeroContent(content) {
  const out = {};
  for (const [k, v] of Object.entries(content)) {
    const base = k.split('__i18n__')[0];
    if (HERO_FIELDS.includes(base)) out[k] = v;
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
    script: '02b-create-grounding-page-story',
    startedAt: new Date().toISOString(),
    mode: live ? 'write' : 'dry-run',
    publish: args.publish,
    action: null,
  };

  console.log(`\nMode: ${live ? 'WRITE' : 'DRY-RUN'} | space ${process.env.STORYBLOK_SPACE_ID}\n`);

  // Component must exist.
  const comps = await mapi('GET', '/components?per_page=100');
  if (!(comps.components || []).some((c) => c.name === COMPONENT)) {
    throw new Error(
      `component "${COMPONENT}" does not exist — run 01b-create-grounding-page.mjs first.`,
    );
  }

  // Target folder (old slug now; new slug after step 6).
  const folderStub =
    (await findBySlugAnywhere(FOLDER_OLD_SLUG)) || (await findBySlugAnywhere(FOLDER_NEW_SLUG));
  if (!folderStub || !folderStub.is_folder) {
    throw new Error(`no grounding folder ("${FOLDER_OLD_SLUG}" or "${FOLDER_NEW_SLUG}").`);
  }
  const { story: folder } = await mapi('GET', `/stories/${folderStub.id}`);

  // The folder restricts content types to `resource_grounding` — widen it to also allow the
  // page component, or the POST below 422s.
  const currentTypes = folder.content?.content_types;
  if (Array.isArray(currentTypes) && !currentTypes.includes(COMPONENT)) {
    const nextTypes = [...currentTypes, COMPONENT];
    if (live) {
      await mapi('PUT', `/stories/${folder.id}`, {
        story: { content: { ...folder.content, content_types: nextTypes } },
      });
      console.log(`  folder   content_types → [${nextTypes.join(', ')}]`);
    } else {
      console.log(`  plan     widen folder content_types → [${nextTypes.join(', ')}]`);
    }
  }

  // Already there?
  const existing =
    (await findBySlugAnywhere(`${FOLDER_OLD_SLUG}/${PAGE_SLUG}`)) ||
    (await findBySlugAnywhere(`${FOLDER_NEW_SLUG}/${PAGE_SLUG}`));

  // Source hero content from the flat page.
  const flatStub = await findBySlugAnywhere(FLAT_GROUNDING_SLUG);
  if (!flatStub)
    throw new Error(
      `flat "${FLAT_GROUNDING_SLUG}" story not found — nothing to copy the hero from.`,
    );
  const { story: flat } = await mapi('GET', `/stories/${flatStub.id}`);
  const hero = pickHeroContent(flat.content);
  const heroKeys = Object.keys(hero);
  console.log(`  hero fields from flat "${flat.full_slug}": ${heroKeys.join(', ')}`);

  const snapshot = { flatGrounding: flat, existingOverview: existing || null };
  fs.writeFileSync(
    path.join(OUT_DIR, `02b-create-grounding-page-story.snapshot.${stamp}.json`),
    JSON.stringify(snapshot, null, 2),
  );

  const content = { component: COMPONENT, ...hero };

  if (existing && !args.update) {
    console.log(
      `  skip     "${existing.full_slug}" already exists (id ${existing.id}). --update to overwrite hero.`,
    );
    manifest.action = 'skip-exists';
  } else if (existing && args.update) {
    if (!live) {
      console.log(`  plan     UPDATE "${existing.full_slug}" hero fields from flat page`);
      manifest.action = 'plan-update';
    } else {
      const { story: cur } = await mapi('GET', `/stories/${existing.id}`);
      const merged = { ...cur.content, ...content };
      const route = args.publish ? `/stories/${existing.id}?publish=1` : `/stories/${existing.id}`;
      const res = await mapi('PUT', route, { story: { content: merged } });
      console.log(
        `  updated  "${res.story.full_slug}" (id ${res.story.id})${args.publish ? ' (published)' : ''}`,
      );
      manifest.action = 'updated';
      manifest.storyId = res.story.id;
    }
  } else {
    const payload = {
      story: { name: PAGE_NAME, slug: PAGE_SLUG, parent_id: folder.id, content },
      publish: args.publish ? 1 : undefined,
    };
    if (!live) {
      console.log(
        `  plan     CREATE "${folder.slug}/${PAGE_SLUG}" (component ${COMPONENT}, ${heroKeys.length} hero fields)${args.publish ? ' + publish' : ' as draft'}`,
      );
      manifest.action = 'plan-create';
      manifest.payload = payload;
    } else {
      const res = await mapi('POST', '/stories', payload);
      console.log(
        `  created  "${res.story.full_slug}" (id ${res.story.id})${args.publish ? ' (published)' : ' (draft)'}`,
      );
      manifest.action = 'created';
      manifest.storyId = res.story.id;
      manifest.storyUuid = res.story.uuid;
    }
  }

  manifest.finishedAt = new Date().toISOString();
  const manifestPath = path.join(OUT_DIR, `02b-create-grounding-page-story.${stamp}.json`);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest → ${path.relative(REPO_ROOT, manifestPath)}`);
  if (!live) console.log('DRY-RUN — nothing was written. Re-run with --write --yes.');
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}`);
  process.exit(1);
});
