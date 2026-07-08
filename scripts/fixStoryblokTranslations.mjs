#!/usr/bin/env node
/**
 * fixStoryblokTranslations.mjs — surgically CORRECT existing Storyblok translations by
 * replacing exact leaf values, scoped to a single locale, and write the result back as
 * a DRAFT (never published).
 *
 * This is the companion to translateStoryblok.mjs:
 *   • translateStoryblok.mjs  → CREATES/COMPLETES translations (gap-fill from English).
 *   • fixStoryblokTranslations.mjs → EDITS translations that already exist (QA fixes:
 *     register/tone, gender agreement, typos, a mistranslated phrase, a leaked English
 *     string, European→Brazilian Portuguese, a broken ICU placeholder, …).
 *
 * WHY A SEPARATE, LANGUAGE-SCOPED TOOL (a hard-won learning):
 *   A leaked/untranslated string is byte-identical in the English SOURCE field and in the
 *   still-untranslated `<field>__i18n__<lang>` copy. A naïve global find-and-replace would
 *   therefore also overwrite the English source. This tool only ever edits values INSIDE a
 *   `<field>__i18n__<lang>` subtree, so the default/English content is guaranteed untouched.
 *   It also reaches leaves embedded in rich-text (accordions/FAQs/exercises), which — as with
 *   translateStoryblok — live inline in the parent field's `__i18n__` copy, not on sibling keys.
 *
 * SAFETY MODEL:
 *   1. Dry-run by default. Nothing is written unless you pass --write --yes.
 *   2. Writes are always drafts (publish: 0). This script NEVER publishes.
 *   3. Only `<field>__i18n__<lang>` subtrees are edited — the English source and every other
 *      locale are preserved byte-for-byte.
 *   4. Whole-VALUE match: a pair [old, new] replaces a leaf only when its value === old
 *      (exact, including punctuation and trailing spaces). No partial/substring edits, so a
 *      short `old` can never accidentally rewrite an unrelated leaf.
 *   5. Each edited story is snapshotted to disk before the write; Storyblok also keeps
 *      per-story version history — rollback is always possible.
 *
 * PAIRS FILE (--pairs): JSON, either
 *   [["old string","new string"], ...]        or        [{"old":"…","new":"…"}, ...]
 * `old` must be copied VERBATIM from the live value (use translateStoryblok --report-sources
 * or the Storyblok editor to get exact strings). Pairs that match nothing are reported, not
 * an error — so one pairs file can be run across several slugs; only matching leaves change.
 *
 * USAGE:
 *   # Dry-run: show what WOULD change on one page for one locale
 *   node scripts/fixStoryblokTranslations.mjs --lang pt --slug therapy/book-session --pairs fixes.pt.json
 *
 *   # Apply as a DRAFT once the dry-run looks right
 *   node scripts/fixStoryblokTranslations.mjs --lang pt --slug therapy/book-session --pairs fixes.pt.json --write --yes
 *
 *   # Run the same fixes across several pages (non-matching pairs are skipped per page)
 *   node scripts/fixStoryblokTranslations.mjs --lang ar --slug home,grounding,activities --pairs fixes.ar.json --write --yes
 *
 * ENV (.env.local auto-loaded): STORYBLOK_OAUTH_TOKEN, STORYBLOK_SPACE_ID,
 *   optional STORYBLOK_MAPI_BASE (default https://mapi.storyblok.com/v1, EU).
 *
 * FLAGS:
 *   --lang <l>        Target locale to edit (e.g. ar, pt). REQUIRED.
 *   --pairs <file>    JSON pairs file (see above). REQUIRED.
 *   --slug <s>        Story full slug(s), comma-separated / repeatable. REQUIRED.
 *   --write           Actually PUT to Storyblok (as DRAFT). Requires --yes.
 *   --yes             Confirm writes (guards against accidental --write).
 *   --out <dir>       Snapshot dir. Default .storyblok-translation
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..');
const I18N = '__i18n__';

// ----------------------------- env & args ------------------------------

// Minimal .env.local loader (no dependency). Only fills vars that aren't already set.
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

function parseArgs(argv) {
  const args = {
    lang: '',
    pairs: '',
    slugs: [],
    write: false,
    yes: false,
    out: path.join(REPO_ROOT, '.storyblok-translation'),
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === '--lang') args.lang = next();
    else if (a === '--pairs') args.pairs = path.resolve(next());
    else if (a === '--slug')
      args.slugs.push(
        ...next()
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      );
    else if (a === '--write') args.write = true;
    else if (a === '--yes') args.yes = true;
    else if (a === '--out') args.out = path.resolve(next());
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

function required(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return v;
}

// ----------------------------- Storyblok Management API ------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function mapiBase() {
  return (process.env.STORYBLOK_MAPI_BASE || 'https://mapi.storyblok.com/v1').replace(/\/$/, '');
}

// Personal access tokens use the raw token; OAuth tokens need a "Bearer " prefix. Try raw
// first, fall back to Bearer once on a 401, and remember which worked. Retry on HTTP 429.
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

async function findStory(slug) {
  const data = await mapi('GET', `/stories?by_slugs=${encodeURIComponent(slug)}`);
  return (data.stories || []).find((s) => s.full_slug === slug || s.slug === slug);
}

// ----------------------------- language-scoped replacement ------------------------------

// Replace every string value / rich-text text node inside a subtree that we've already
// established belongs to the target locale.
function replaceInSubtree(node, pairs, stats) {
  if (Array.isArray(node)) return node.forEach((x) => replaceInSubtree(x, pairs, stats));
  if (!node || typeof node !== 'object') return;
  if (node.type === 'text' && typeof node.text === 'string' && pairs.has(node.text)) {
    stats.hit(node.text);
    node.text = pairs.get(node.text);
  }
  for (const key of Object.keys(node)) {
    if (typeof node[key] === 'string' && pairs.has(node[key])) {
      stats.hit(node[key]);
      node[key] = pairs.get(node[key]);
    } else if (node[key] && typeof node[key] === 'object') {
      replaceInSubtree(node[key], pairs, stats);
    }
  }
}

// Walk the whole story but only DIVE into replacement mode when we cross a
// `<field>__i18n__<lang>` key — never touching the base (English/default) fields.
function applyPairsForLang(content, lang, pairs, stats) {
  const suffix = I18N + lang;
  (function walk(node) {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== 'object') return;
    for (const key of Object.keys(node)) {
      if (key.endsWith(suffix)) {
        if (typeof node[key] === 'string' && pairs.has(node[key])) {
          stats.hit(node[key]);
          node[key] = pairs.get(node[key]);
        } else if (node[key] && typeof node[key] === 'object') {
          replaceInSubtree(node[key], pairs, stats);
        }
      } else if (node[key] && typeof node[key] === 'object' && !key.includes(I18N)) {
        walk(node[key]);
      }
    }
  })(content);
}

function loadPairs(file) {
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  const entries = raw.map((p) => (Array.isArray(p) ? p : [p.old, p.new]));
  for (const [o, n] of entries) {
    if (typeof o !== 'string' || typeof n !== 'string')
      throw new Error(`Bad pair (need [old,new] strings): ${JSON.stringify([o, n])}`);
  }
  return new Map(entries);
}

// ----------------------------- main ------------------------------

async function main() {
  loadDotEnv();
  const args = parseArgs(process.argv.slice(2));
  if (!args.lang || !args.pairs || !args.slugs.length) {
    console.error('Required: --lang <locale> --pairs <file.json> --slug <slug[,slug…]>');
    process.exit(1);
  }
  if (args.write && !args.yes) {
    console.error('--write requires --yes (safety confirmation). Aborting.');
    process.exit(1);
  }
  fs.mkdirSync(args.out, { recursive: true });
  const pairs = loadPairs(args.pairs);

  console.log(
    `\nMode: ${args.write ? 'WRITE (draft)' : 'DRY-RUN'} | locale: ${args.lang} | ` +
      `pairs: ${pairs.size} | stories: ${args.slugs.length}`,
  );

  let totalHits = 0;
  for (const slug of args.slugs) {
    console.log(`\n▸ ${slug}`);
    const stub = await findStory(slug);
    if (!stub) {
      console.warn(`  ! not found — skipping`);
      continue;
    }
    const { story } = await mapi('GET', `/stories/${stub.id}`);

    // Track distinct pairs matched and total leaf replacements (a pair can match many leaves).
    const matched = new Set();
    let replacements = 0;
    const stats = {
      hit: (v) => {
        matched.add(v);
        replacements++;
      },
    };

    // Snapshot BEFORE mutating (only meaningful when we actually write, but cheap + safe).
    if (args.write) {
      const safe = slug.replace(/[^\w.-]+/g, '_');
      fs.writeFileSync(
        path.join(args.out, `${safe}.beforefix.json`),
        JSON.stringify(story, null, 2),
      );
    }

    applyPairsForLang(story.content, args.lang, pairs, stats);
    totalHits += replacements;

    if (replacements === 0) {
      console.log(`  no matching leaves for [${args.lang}] — nothing to change`);
      continue;
    }
    console.log(
      `  ${replacements} leaf value(s) matched across ${matched.size}/${pairs.size} pair(s)`,
    );

    if (!args.write) {
      console.log(`  DRY-RUN — no write. Re-run with --write --yes to apply as a draft.`);
      continue;
    }
    await mapi('PUT', `/stories/${stub.id}`, { story: { content: story.content }, publish: 0 });
    console.log(`  ✓ wrote DRAFT (publish:0). Review in the editor before publishing.`);
  }

  console.log(
    `\n${totalHits} total replacement(s) ${args.write ? 'written as draft' : '(dry-run)'} across ${args.slugs.length} story(ies).`,
  );
  if (!totalHits) {
    console.log(
      `No pair matched any story. Check that --lang is right and that each "old" value is copied ` +
        `VERBATIM (including trailing spaces) from the live translation.`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
