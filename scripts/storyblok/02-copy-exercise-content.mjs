#!/usr/bin/env node
/**
 * 02-copy-exercise-content.mjs — Step 2 of the resource-types migration
 * (docs/resource-type-rename-plan.md).
 *
 * Copies every grounding + activity accordion item out of the flat `grounding` / `activities`
 * `page` stories and into its own `resource_grounding` / `resource_activity` story, under
 * `grounding-exercises/` / `activity/` (folders created in step 1).
 *
 * WHERE THE SOURCE DATA LIVES: the flat pages' `page_sections[0].content` is a richtext doc with
 * `accordion` bloks embedded in it; each `accordion` has `accordion_items`. Per-locale text lives
 * as a FULL richtext-doc copy on `page_sections[0].content__i18n__<lang>` (Storyblok renders
 * embedded-in-richtext content from the parent field's i18n copy) — items are matched across
 * locales by `accordion_id`, NOT `_uid` (embedded-blok uids are regenerated per i18n copy).
 *
 * PER ITEM:
 *   · slug = accordion_id VERBATIM (including the existing "grouding-sound-of-claps" typo) —
 *     so `?openacc=<id>` (old) and `?id=<id>` (new) are the same string; no per-item redirect.
 *   · name = the item's title; body = the item's body richtext, both copied with every locale
 *     that has both a title and a body translated (some items are missing one locale).
 *   · languages = ['default', ...locales with a translation] (checked by the resource pages'
 *     `locale === 'en' || languages.includes(locale)` gate); included_for_partners = ['Public']
 *     for grounding (its listing always treats every visitor as public — see GroundingPage.tsx)
 *     and every partner for activity — the library/carousel partner filter only grants 'public'
 *     tier to a visitor with no partner account, so an activity tagged 'Public' alone would drop
 *     out of a partner user's library/related-content cards (it stays visible on its own page,
 *     which has a separate 'Public' override) unless every partner is listed explicitly, matching
 *     how existing shorts/conversations content is authored.
 *   · resource_activity also gets login_required = true (decision 1; today's flat /activities
 *     page is public, so this is a deliberate gating change — confirmed with product).
 *   · resource_grounding has no login_required field at all (decision 2 — always public).
 *   · translated_slugs is NOT set: the source pages carry none (translated_slugs: []) and the
 *     slug is locale-invariant, so there's nothing to carry.
 *
 * DRAFTS ONLY: stories are created UNPUBLISHED. The backend step-1 deploy (webhook that derives
 * `resource.category` and creates the row `resource_activity` publishes need) has not shipped
 * yet, so nothing here is published and no webhook fires. Run with --publish once that backend
 * deploy is live and the content-team schema review has signed off — see the header of
 * 01-create-blocks.mjs for what's still outstanding. `--publish` alone re-publishes every
 * existing draft in scope (no content changes); combine with the copy step or run standalone.
 *
 * Idempotent: a story that already exists at the target slug is left alone by the copy step
 * (use --republish to force-update + re-publish a story that already exists).
 *
 * SAFETY
 *   · Dry-run by default. Nothing is written unless you pass BOTH --write and --yes.
 *   · Every run writes a manifest to .storyblok-provision/, incl. { oldAccordionId, type,
 *     newSlug, newUuid } per item — feeds steps 3 and 5.
 *
 * USAGE
 *   node scripts/storyblok/02-copy-exercise-content.mjs                    # dry-run
 *   node scripts/storyblok/02-copy-exercise-content.mjs --write --yes      # create drafts
 *   node scripts/storyblok/02-copy-exercise-content.mjs --publish --write --yes   # publish
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

const LOCALES = ['ar', 'de', 'es', 'fr', 'hi', 'pt', 'tr']; // non-English locales, per i18n/routing.ts
const I18N = '__i18n__';
const PARTNERS = ['Public', 'Badoo', 'Fruitz', 'Bumble']; // per lib/constants/partners.ts

const SOURCES = [
  { flatSlug: 'grounding', folderSlug: 'grounding-exercises', component: 'resource_grounding' },
  { flatSlug: 'activities', folderSlug: 'activity', component: 'resource_activity' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PACE_MS = 350;

// ----------------------------- args & env ------------------------------

function parseArgs(argv) {
  const args = { write: false, yes: false, publish: false, republish: false };
  for (const a of argv) {
    if (a === '--write') args.write = true;
    else if (a === '--yes') args.yes = true;
    else if (a === '--dry-run') args.write = false;
    else if (a === '--publish') args.publish = true;
    else if (a === '--republish') args.republish = true;
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

async function findStoryBySlug(slug) {
  const data = await mapi('GET', `/stories?by_slugs=${encodeURIComponent(slug)}`);
  return (data.stories || []).find((s) => s.full_slug === slug);
}

async function findFolderBySlug(slug) {
  const data = await mapi('GET', `/stories?by_slugs=${encodeURIComponent(slug)}`);
  return (data.stories || []).find((s) => s.is_folder && s.slug === slug);
}

// ----------------------------- richtext-doc walking ------------------------------

// Collect every `accordion_item` embedded anywhere under `node`, not recursing into i18n
// sibling keys (those are separate locale copies, walked independently by the caller).
function findAccordionItems(node, acc = []) {
  if (Array.isArray(node)) {
    node.forEach((n) => findAccordionItems(n, acc));
    return acc;
  }
  if (!node || typeof node !== 'object') return acc;
  if (node.component === 'accordion' && Array.isArray(node.accordion_items)) {
    acc.push(...node.accordion_items);
  }
  for (const k of Object.keys(node)) {
    if (k.includes(I18N)) continue;
    if (node[k] && typeof node[k] === 'object') findAccordionItems(node[k], acc);
  }
  return acc;
}

// ----------------------------- per-source extraction ------------------------------

/**
 * Build the list of { accordionId, title, body, locales: { <lang>: { title, body } } } for one
 * flat page's accordion items, reading the default doc + each locale's i18n richtext copy.
 */
function extractItems(story) {
  const ps0 = story.content.page_sections?.[0];
  if (!ps0 || !ps0.content) {
    throw new Error(`"${story.full_slug}" has no page_sections[0].content to read accordions from`);
  }
  const defaultItems = findAccordionItems(ps0.content);
  const byLocale = {};
  for (const loc of LOCALES) {
    const doc = ps0[`content${I18N}${loc}`];
    byLocale[loc] = doc ? findAccordionItems(doc) : [];
  }

  const items = defaultItems.map((it) => {
    if (!it.accordion_id) {
      throw new Error(`accordion item "${it.title}" in "${story.full_slug}" has no accordion_id`);
    }
    const locales = {};
    for (const loc of LOCALES) {
      const match = byLocale[loc].find((x) => x.accordion_id === it.accordion_id);
      if (match && match.title && match.body)
        locales[loc] = { title: match.title, body: match.body };
    }
    return { accordionId: it.accordion_id, title: it.title, body: it.body, locales };
  });

  const ids = items.map((i) => i.accordionId);
  const dupes = ids.filter((v, i) => ids.indexOf(v) !== i);
  if (dupes.length) throw new Error(`duplicate accordion_id(s) in "${story.full_slug}": ${dupes}`);

  return items;
}

// ----------------------------- story payload ------------------------------

function buildStoryPayload(item, source, folderId) {
  const content = {
    component: source.component,
    name: item.title,
    body: item.body,
    languages: ['default', ...Object.keys(item.locales)],
    included_for_partners: source.component === 'resource_activity' ? PARTNERS : ['Public'],
  };
  if (source.component === 'resource_activity') {
    content.login_required = true; // decision 1 — see file header
  }
  for (const [loc, { title, body }] of Object.entries(item.locales)) {
    content[`name${I18N}${loc}`] = title;
    content[`body${I18N}${loc}`] = body;
  }

  return {
    story: {
      name: item.title,
      slug: item.accordionId,
      parent_id: folderId,
      content,
    },
  };
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
    script: '02-copy-exercise-content',
    startedAt: new Date().toISOString(),
    mode: live ? 'write' : 'dry-run',
    publish: args.publish,
    space: process.env.STORYBLOK_SPACE_ID,
    items: [], // { oldAccordionId, type, newSlug, newUuid, locales, status }
  };

  console.log(
    `\nMode: ${live ? 'WRITE' : 'DRY-RUN'}${args.publish ? ' + PUBLISH' : ' (drafts only)'} | space ${process.env.STORYBLOK_SPACE_ID}\n`,
  );

  for (const source of SOURCES) {
    console.log(`\n### ${source.flatSlug} → ${source.folderSlug}/ (${source.component})`);

    const flat = await findStoryBySlug(source.flatSlug);
    if (!flat) throw new Error(`flat page "${source.flatSlug}" not found — has it been deleted?`);
    const { story } = await mapi('GET', `/stories/${flat.id}`);

    const folder = await findFolderBySlug(source.folderSlug);
    if (!folder) {
      throw new Error(`folder "${source.folderSlug}/" not found — run 01-create-blocks.mjs first`);
    }

    const items = extractItems(story);
    console.log(`  found ${items.length} accordion item(s)`);

    for (const item of items) {
      const targetSlug = `${source.folderSlug}/${item.accordionId}`;
      const localesFound = Object.keys(item.locales);
      const missingLocales = LOCALES.filter((l) => !localesFound.includes(l));
      const label = `${item.accordionId}  "${item.title.trim()}"`;

      const existing = await findStoryBySlug(targetSlug);
      if (existing && !args.republish) {
        console.log(`  skip     ${label} (already exists, id ${existing.id})`);
        manifest.items.push({
          oldAccordionId: item.accordionId,
          type: source.component,
          newSlug: targetSlug,
          newUuid: existing.uuid,
          locales: localesFound,
          status: 'skip-exists',
        });
        continue;
      }

      const payload = buildStoryPayload(item, source, folder.id);
      if (missingLocales.length) {
        console.log(
          `  ${'note'.padEnd(8)} ${label} — no translation for: ${missingLocales.join(', ')}`,
        );
      }

      if (!live) {
        console.log(`  plan     ${label} (${localesFound.length} locales)`);
        manifest.items.push({
          oldAccordionId: item.accordionId,
          type: source.component,
          newSlug: targetSlug,
          newUuid: undefined,
          locales: localesFound,
          status: 'planned',
          payload, // full request body, for pre-flight review
        });
        continue;
      }

      let storyId, uuid;
      if (existing && args.republish) {
        const res = await mapi('PUT', `/stories/${existing.id}`, payload);
        storyId = res.story.id;
        uuid = res.story.uuid;
        console.log(`  updated  ${label} (id ${storyId})`);
      } else {
        const res = await mapi('POST', '/stories', payload);
        storyId = res.story.id;
        uuid = res.story.uuid;
        console.log(`  created  ${label} (id ${storyId}, draft)`);
      }
      await sleep(PACE_MS);

      if (args.publish) {
        const res = await mapi('PUT', `/stories/${storyId}?publish=1`, payload);
        uuid = res.story.uuid;
        console.log(`  published ${label}`);
        await sleep(PACE_MS);
      }

      manifest.items.push({
        oldAccordionId: item.accordionId,
        type: source.component,
        newSlug: targetSlug,
        newUuid: uuid,
        locales: localesFound,
        status: args.publish ? 'published' : 'draft',
      });
    }
  }

  manifest.finishedAt = new Date().toISOString();
  const manifestPath = path.join(OUT_DIR, `02-copy-exercise-content.${stamp}.json`);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest → ${path.relative(REPO_ROOT, manifestPath)}`);

  if (!live) {
    console.log('\nDRY-RUN — nothing was written. Re-run with --write --yes to create drafts.');
  } else if (!args.publish) {
    console.log(
      '\nDrafts created. No resource rows exist yet (nothing published, no webhook fired).\n' +
        'Re-run with --publish --write --yes once the backend step-1 deploy is live and the\n' +
        'content-team schema review has signed off.',
    );
  } else {
    console.log('\nPublished. Verify resource rows next — see step 2 in the plan.');
  }
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}`);
  process.exit(1);
});
