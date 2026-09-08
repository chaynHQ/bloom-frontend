#!/usr/bin/env node
/**
 * 05-rename-themes.mjs — rename two library themes from "harm" to "abuse".
 *
 *     recognising-harm   → recognising-abuse
 *     why-harm-happens   → why-abuse-happens
 *
 * The theme identifiers live in the `themes` datasource (entry `value` + `name`) and, as
 * stored strings, in the `themes` field of every tagged Course / Session / resource story.
 * The matching frontend (`ThemeKey` in lib/utils/libraryData.ts) and backend (`THEMES` in
 * bloom-backend src/utils/constants.ts + the `*_themes_enum` Postgres types) are renamed in
 * the same change set.
 *
 * ORDER: publishing a story fires the Storyblok content webhook at bloom-backend, which
 * writes `content.themes` into a Postgres enum. A backend still on `recognising-harm` rejects
 * the new value and fails the whole story sync — so either run the bloom-backend enum
 * migration on every webhook target (staging + production) FIRST, or use --draft-only and
 * republish after both the backend migration and the frontend rename are live.
 *
 * WHAT IT DOES
 *   1. PUT /datasource_entries/:id — rename the two entries (value + name). "Recognising harm"
 *      → "Recognising abuse", "Why harm happens" → "Why abuse happens". (Editor-facing only;
 *      no webhook.)
 *   2. For every story whose `content.themes` contains an old slug: replace the slug(s),
 *      de-dupe, and PUT the story back.
 *        · published & no pending draft changes → republished (?publish=1)
 *        · published WITH pending draft changes → draft updated only, and reported. Re-run
 *          with --publish-pending to republish these too (this also pushes their pending
 *          edits live — check the manifest first).
 *        · draft-only story → draft updated, stays unpublished.
 *      --draft-only forces EVERY write to draft: published versions keep the old themes (and
 *      gain "unpublished changes") until a later republish. No webhook fires.
 *
 * Discovery uses the public delivery API (version=draft) so a brand-new tagged story is
 * still found. Idempotent: an entry / story already on the new slug is reported "skip".
 *
 * SAFETY
 *   · Dry-run by default. Nothing is written unless you pass BOTH --write and --yes.
 *   · Every run writes a manifest (planned + performed changes, before/after themes) to
 *     .storyblok-provision/05-rename-themes.<timestamp>.json — diff it before the live run.
 *   · Requests are sequential with a short pace delay; 429s retry with backoff.
 *
 * USAGE
 *   node scripts/storyblok/05-rename-themes.mjs                          # dry-run
 *   node scripts/storyblok/05-rename-themes.mjs --write --yes --draft-only  # draft only, no webhook
 *   node scripts/storyblok/05-rename-themes.mjs --write --yes            # apply + republish
 *   node scripts/storyblok/05-rename-themes.mjs --write --yes --publish-pending
 *
 * ENV (.env.local is auto-loaded): STORYBLOK_OAUTH_TOKEN, STORYBLOK_SPACE_ID,
 *   NEXT_PUBLIC_STORYBLOK_TOKEN (public delivery token, for discovery),
 *   optional STORYBLOK_MAPI_BASE (default https://mapi.storyblok.com/v1, EU).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..', '..');
const OUT_DIR = path.join(REPO_ROOT, '.storyblok-provision');

const DATASOURCE_SLUG = 'themes';

// old slug → { value, name } after the rename
const RENAMES = {
  'recognising-harm': { value: 'recognising-abuse', name: 'Recognising abuse' },
  'why-harm-happens': { value: 'why-abuse-happens', name: 'Why abuse happens' },
};
const OLD_SLUGS = Object.keys(RENAMES);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PACE_MS = 350;

// ----------------------------- args & env ------------------------------

function parseArgs(argv) {
  const args = { write: false, yes: false, publishPending: false, draftOnly: false };
  for (const a of argv) {
    if (a === '--write') args.write = true;
    else if (a === '--yes') args.yes = true;
    else if (a === '--dry-run') args.write = false;
    else if (a === '--publish-pending') args.publishPending = true;
    else if (a === '--draft-only') args.draftOnly = true;
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

// ----------------------------- discovery (delivery API) ------------------------------

// The delivery API's `filter_query[themes][any_in_array]` actually filters (the MAPI one
// does not), and version=draft covers not-yet-published stories.
async function findTaggedStories() {
  const token = required('NEXT_PUBLIC_STORYBLOK_TOKEN');
  const byId = new Map();
  for (const slug of OLD_SLUGS) {
    for (let page = 1; page < 20; page++) {
      const url =
        `https://api.storyblok.com/v2/cdn/stories?token=${token}&version=draft&per_page=100` +
        `&page=${page}&filter_query[themes][any_in_array]=${encodeURIComponent(slug)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`delivery API ${res.status}: ${await res.text()}`);
      const batch = (await res.json()).stories || [];
      for (const s of batch) byId.set(s.id, { id: s.id, full_slug: s.full_slug });
      if (batch.length < 100) break;
      await sleep(PACE_MS);
    }
  }
  return [...byId.values()].sort((a, b) => a.full_slug.localeCompare(b.full_slug));
}

function remapThemes(themes) {
  const mapped = (themes || []).map((t) => RENAMES[t]?.value ?? t);
  return [...new Set(mapped)];
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
  if (args.draftOnly && args.publishPending) {
    console.error('--draft-only and --publish-pending are mutually exclusive. Aborting.');
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const manifest = {
    script: '05-rename-themes',
    startedAt: new Date().toISOString(),
    mode: live ? 'write' : 'dry-run',
    publishPending: args.publishPending,
    draftOnly: args.draftOnly,
    renames: RENAMES,
    datasourceEntries: [],
    stories: [],
  };

  const flag = args.draftOnly
    ? ' (--draft-only)'
    : args.publishPending
      ? ' (--publish-pending)'
      : '';
  console.log(
    `\nMode: ${live ? 'WRITE' : 'DRY-RUN'}${flag} | space ${process.env.STORYBLOK_SPACE_ID}\n`,
  );

  // ---- 1. datasource entries ----
  const ds = (await mapi('GET', `/datasources`)).datasources.find(
    (d) => d.slug === DATASOURCE_SLUG,
  );
  if (!ds) throw new Error(`datasource "${DATASOURCE_SLUG}" not found`);
  const entries = (await mapi('GET', `/datasource_entries?datasource_id=${ds.id}&per_page=100`))
    .datasource_entries;

  console.log('### datasource entries');
  for (const oldSlug of OLD_SLUGS) {
    const target = RENAMES[oldSlug];
    const entry =
      entries.find((e) => e.value === oldSlug) || entries.find((e) => e.value === target.value);
    if (!entry) {
      console.log(`  MISS     no entry for "${oldSlug}" or "${target.value}"`);
      manifest.datasourceEntries.push({ oldSlug, status: 'missing' });
      continue;
    }
    if (entry.value === target.value && entry.name === target.name) {
      console.log(`  skip     ${target.value} — already renamed`);
      manifest.datasourceEntries.push({ id: entry.id, oldSlug, status: 'skip-correct' });
      continue;
    }
    manifest.datasourceEntries.push({
      id: entry.id,
      from: { value: entry.value, name: entry.name },
      to: target,
      status: live ? 'updated' : 'planned',
    });
    if (!live) {
      console.log(
        `  plan     ${entry.value} / "${entry.name}" → ${target.value} / "${target.name}"`,
      );
      continue;
    }
    await mapi('PUT', `/datasource_entries/${entry.id}`, {
      datasource_entry: { name: target.name, value: target.value },
    });
    console.log(`  updated  ${target.value} / "${target.name}"`);
    await sleep(PACE_MS);
  }

  // ---- 2. stories ----
  const found = await findTaggedStories();
  console.log(`\n### stories (${found.length} tagged)`);

  for (const stub of found) {
    const { story } = await mapi('GET', `/stories/${stub.id}`);
    const before = story.content.themes || [];
    const after = remapThemes(before);
    const changed = before.length !== after.length || before.some((t, i) => t !== after[i]);

    const state = !story.published
      ? 'draft-only'
      : story.unpublished_changes
        ? 'pending-changes'
        : 'published';
    const label = `${story.full_slug} [${state}]`;

    if (!changed) {
      console.log(`  skip     ${label} — themes already ${JSON.stringify(after)}`);
      manifest.stories.push({
        slug: story.full_slug,
        state,
        themes: before,
        status: 'skip-correct',
      });
      continue;
    }

    // Republish a live story only when it has no pending draft edits to leak; otherwise keep
    // the change in draft unless the operator opted in with --publish-pending. --draft-only
    // forces every write to draft (published versions keep the old themes until a later republish).
    const republish =
      !args.draftOnly && story.published && (!story.unpublished_changes || args.publishPending);
    const record = {
      slug: story.full_slug,
      storyId: story.id,
      state,
      themesBefore: before,
      themesAfter: after,
      republish,
    };

    if (!live) {
      console.log(
        `  plan     ${label} — ${JSON.stringify(before)} → ${JSON.stringify(after)}` +
          `${republish ? ' (republish)' : ' (draft only)'}`,
      );
      manifest.stories.push({ ...record, status: 'planned' });
      continue;
    }

    const route = republish ? `/stories/${story.id}?publish=1` : `/stories/${story.id}`;
    await mapi('PUT', route, { story: { content: { ...story.content, themes: after } } });
    console.log(
      `  updated  ${label} → ${JSON.stringify(after)}${republish ? ' (republished)' : ' (draft only)'}`,
    );
    manifest.stories.push({ ...record, status: republish ? 'updated-published' : 'updated-draft' });
    await sleep(PACE_MS);
  }

  manifest.finishedAt = new Date().toISOString();
  const manifestPath = path.join(OUT_DIR, `05-rename-themes.${stamp}.json`);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest → ${path.relative(REPO_ROOT, manifestPath)}`);

  const draftedLive = manifest.stories.filter(
    (s) => s.state !== 'draft-only' && s.status !== 'skip-correct' && !s.republish,
  );
  if (draftedLive.length) {
    console.log(
      `\n⚠️  ${draftedLive.length} published stor${draftedLive.length === 1 ? 'y' : 'ies'} updated in DRAFT only — ` +
        `the published version keeps the old themes until you republish:\n` +
        draftedLive.map((s) => `     ${s.slug}`).join('\n') +
        (args.draftOnly
          ? `\n   Re-run without --draft-only (or republish in Storyblok) after release.`
          : `\n   Re-run with --publish-pending once those pending edits are reviewed.`),
    );
  }
  if (!live) {
    console.log('\nDRY-RUN — nothing was written. Re-run with --write --yes to apply.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
