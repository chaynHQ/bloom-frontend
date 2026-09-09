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
 *   2. CONVERT the flat `grounding` story (component: page, id from lookup) into the grounding
 *      landing page: move it into the grounding folder, reslug to `overview`, set
 *      `content.component = 'grounding_page'` (created by 01b-create-grounding-page.mjs), and
 *      drop `page_sections` (+ its i18n copies) — the old embedded accordion, now redundant.
 *      Its hero fields (title / description / header_image / seo_description, all locales) are
 *      kept. The story keeps its uuid and id.
 *
 *   3. RENAME the folder slug `grounding-exercises` → `grounding`. Freed by (2) moving the flat
 *      `grounding` story off the root. Transparent to the app (component filter + leaf-slug
 *      `?id=`; uuid refs). The folder's `content_types` gains `grounding_page`.
 *
 *   4. RE-PUBLISH `grounding/overview` so the new path/content is live. Child `resource_grounding`
 *      stories are only re-published with --republish-children (the app doesn't use the folder
 *      path).
 *
 * The frontend must already be deployed with `StoryblokGrounding` + the `grounding/overview`
 * fetch (it falls back to the flat `grounding` story until this runs, so the order is safe
 * either way, but run this only after that deploy is verified).
 *
 * RECOVERY: full pre-change story objects are snapshotted to
 *   .storyblok-provision/04-delete-flat-pages.snapshot.<stamp>.json before any write.
 *
 * Idempotent: a missing/renamed target is skipped; a `grounding` story already on the
 * `grounding_page` component inside the folder is left alone.
 *
 * SAFETY
 *   · Dry-run by default. Writes need --write --yes.
 *   · Guards: the flat stories must be `is_folder:false` + `component:page`; the folder must be
 *     `is_folder:true`; `grounding_page` must exist as a component.
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

const FLAT_ACTIVITIES_SLUG = 'activities';
const FLAT_GROUNDING_SLUG = 'grounding';
const FOLDER_OLD_SLUG = 'grounding-exercises';
const FOLDER_NEW_SLUG = 'grounding';
const GROUNDING_PAGE_COMPONENT = 'grounding_page';
const GROUNDING_PAGE_SLUG = 'overview';

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
  return (data.stories || []).find((s) => s.slug === slug);
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

async function componentExists(name) {
  for (let page = 1; page < 10; page++) {
    const data = await mapi('GET', `/components?per_page=100&page=${page}`);
    const batch = data.components || [];
    if (batch.some((c) => c.name === name)) return true;
    if (batch.length < 100) break;
  }
  return false;
}

// Drop `page_sections` and any `page_sections__i18n__*` copies.
function stripPageSections(content) {
  const next = {};
  for (const [k, v] of Object.entries(content)) {
    if (k === 'page_sections' || k.startsWith('page_sections__i18n__')) continue;
    next[k] = v;
  }
  return next;
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
    deleteActivities: null,
    convertGrounding: null,
    folderRename: null,
    republish: [],
  };
  const snapshots = {};

  console.log(`\nMode: ${live ? 'WRITE' : 'DRY-RUN'} | space ${process.env.STORYBLOK_SPACE_ID}\n`);

  if (!(await componentExists(GROUNDING_PAGE_COMPONENT))) {
    throw new Error(
      `guard: component "${GROUNDING_PAGE_COMPONENT}" does not exist — run 01b-create-grounding-page.mjs first.`,
    );
  }

  // ---- 1. delete flat `activities` ----------------------------------------------
  const actStub = await findBySlugAnywhere(FLAT_ACTIVITIES_SLUG);
  if (!actStub) {
    console.log(`  skip     flat "${FLAT_ACTIVITIES_SLUG}" — not found (already deleted?)`);
    manifest.deleteActivities = { id: null, status: 'not-found' };
  } else {
    const { story } = await mapi('GET', `/stories/${actStub.id}`);
    if (story.is_folder || story.content?.component !== 'page') {
      throw new Error(
        `guard: "${FLAT_ACTIVITIES_SLUG}" (id ${story.id}) is not a flat page — is_folder=${story.is_folder}, component=${story.content?.component}.`,
      );
    }
    snapshots.activities = story;
    if (live) {
      await mapi('DELETE', `/stories/${story.id}`);
      console.log(`  deleted  flat "${story.full_slug}" (id ${story.id})`);
      manifest.deleteActivities = { id: story.id, status: 'deleted' };
      await sleep(PACE_MS);
    } else {
      console.log(`  plan     DELETE flat "${story.full_slug}" (id ${story.id})`);
      manifest.deleteActivities = { id: story.id, status: 'planned' };
    }
  }

  // ---- 2. resolve the folder + 3. plan the rename ------------------------------
  let folder = await findBySlugAnywhere(FOLDER_NEW_SLUG);
  let folderAlreadyRenamed = Boolean(folder && folder.is_folder);
  if (!folderAlreadyRenamed) {
    folder = await findBySlugAnywhere(FOLDER_OLD_SLUG);
    if (!folder)
      throw new Error(`guard: no folder "${FOLDER_OLD_SLUG}" and none "${FOLDER_NEW_SLUG}".`);
  }
  const { story: folderStory } = await mapi('GET', `/stories/${folder.id}`);
  if (!folderStory.is_folder)
    throw new Error(`guard: "${folder.slug}" (id ${folder.id}) is not a folder.`);

  // ---- 2. convert the flat `grounding` story ----------------------------------
  const groundingStub =
    (await findBySlugAnywhere(FLAT_GROUNDING_SLUG)) ||
    (await findBySlugAnywhere(`${FOLDER_NEW_SLUG}/${GROUNDING_PAGE_SLUG}`)) ||
    (await findBySlugAnywhere(`${FOLDER_OLD_SLUG}/${GROUNDING_PAGE_SLUG}`));

  if (!groundingStub) {
    console.log(`  skip     flat "${FLAT_GROUNDING_SLUG}" — not found (already converted?)`);
    manifest.convertGrounding = { id: null, status: 'not-found' };
  } else {
    const { story } = await mapi('GET', `/stories/${groundingStub.id}`);
    const alreadyConverted =
      !story.is_folder &&
      story.content?.component === GROUNDING_PAGE_COMPONENT &&
      story.parent_id === folder.id &&
      story.slug === GROUNDING_PAGE_SLUG;

    if (alreadyConverted) {
      console.log(`  skip     "${story.full_slug}" already the ${GROUNDING_PAGE_COMPONENT} page`);
      manifest.convertGrounding = { id: story.id, status: 'already-converted' };
    } else {
      if (
        story.is_folder ||
        (story.content?.component !== 'page' &&
          story.content?.component !== GROUNDING_PAGE_COMPONENT)
      ) {
        throw new Error(
          `guard: "${story.full_slug}" (id ${story.id}) is not the flat grounding page — is_folder=${story.is_folder}, component=${story.content?.component}.`,
        );
      }
      snapshots.grounding = story;
      const nextContent = {
        ...stripPageSections(story.content),
        component: GROUNDING_PAGE_COMPONENT,
      };
      const payload = {
        story: { parent_id: folder.id, slug: GROUNDING_PAGE_SLUG, content: nextContent },
      };
      if (live) {
        const res = await mapi('PUT', `/stories/${story.id}?publish=1`, payload);
        console.log(
          `  converted "${story.full_slug}" → "${res.story.full_slug}" (component ${GROUNDING_PAGE_COMPONENT}, page_sections dropped, republished)`,
        );
        manifest.convertGrounding = {
          id: story.id,
          status: 'converted',
          newFullSlug: res.story.full_slug,
        };
        await sleep(PACE_MS);
      } else {
        console.log(
          `  plan     CONVERT "${story.full_slug}" (id ${story.id}) → parent ${folder.id}, slug "${GROUNDING_PAGE_SLUG}", component ${GROUNDING_PAGE_COMPONENT}, drop page_sections`,
        );
        manifest.convertGrounding = { id: story.id, status: 'planned' };
      }
    }
  }

  // ---- 3. rename the folder ---------------------------------------------------
  if (folderAlreadyRenamed) {
    console.log(`  skip     folder rename — "${FOLDER_NEW_SLUG}/" already exists`);
    manifest.folderRename = {
      id: folder.id,
      from: null,
      to: FOLDER_NEW_SLUG,
      status: 'already-renamed',
    };
  } else {
    const wantContentTypes = Array.isArray(folderStory.content?.content_types)
      ? [...new Set([...folderStory.content.content_types, GROUNDING_PAGE_COMPONENT])]
      : undefined;
    const folderPayload = { story: { slug: FOLDER_NEW_SLUG } };
    if (wantContentTypes) {
      folderPayload.story.content = { ...folderStory.content, content_types: wantContentTypes };
    }
    if (live) {
      await mapi('PUT', `/stories/${folder.id}`, folderPayload);
      console.log(`  renamed  folder id ${folder.id}: "${folder.slug}" → "${FOLDER_NEW_SLUG}"`);
      manifest.folderRename = {
        id: folder.id,
        from: folder.slug,
        to: FOLDER_NEW_SLUG,
        status: 'renamed',
      };
      await sleep(PACE_MS);
    } else {
      console.log(
        `  plan     RENAME folder id ${folder.id}: "${folder.slug}" → "${FOLDER_NEW_SLUG}"`,
      );
      manifest.folderRename = {
        id: folder.id,
        from: folder.slug,
        to: FOLDER_NEW_SLUG,
        status: 'planned',
      };
    }
  }

  // ---- snapshot before it matters -------------------------------------------------
  if (Object.keys(snapshots).length) {
    const snapPath = path.join(OUT_DIR, `04-delete-flat-pages.snapshot.${stamp}.json`);
    fs.writeFileSync(snapPath, JSON.stringify(snapshots, null, 2));
    console.log(`\n  Snapshot → ${path.relative(REPO_ROOT, snapPath)}`);
  }

  // ---- 4. re-publish children (opt-in) -----------------------------------------
  if (args.republishChildren) {
    const children = await listChildren(folder.id);
    const published = children.filter(
      (c) => !c.is_folder && c.published && c.slug !== GROUNDING_PAGE_SLUG,
    );
    console.log(
      `\n  ${published.length}/${children.length} child stor${published.length === 1 ? 'y' : 'ies'} published — re-publishing for the new folder path`,
    );
    for (const child of published) {
      if (live) {
        const { story: fresh } = await mapi('GET', `/stories/${child.id}`);
        await mapi('PUT', `/stories/${child.id}?publish=1`, { story: { content: fresh.content } });
        console.log(`  republished ${child.slug} (id ${child.id})`);
        manifest.republish.push({ slug: child.slug, id: child.id, status: 'republished' });
        await sleep(PACE_MS);
      } else {
        console.log(`  plan     republish ${child.slug} (id ${child.id})`);
        manifest.republish.push({ slug: child.slug, id: child.id, status: 'planned' });
      }
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
