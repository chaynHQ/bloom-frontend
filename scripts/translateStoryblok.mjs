#!/usr/bin/env node
/**
 * translateStoryblok.mjs — fetch English Storyblok stories, translate their
 * field-level translatable fields into new locales, and write the translations
 * back as DRAFT (never published).
 *
 * Why this lives in bloom-frontend: the pages it translates (home, welcome/*,
 * policies/*, meet-the-team, messaging, therapy/book-session, subscription/whatsapp,
 * grounding/* + activities/* exercises, and generic single pages) are frontend-only
 * Storyblok stories. bloom-backend only stores Storyblok *uuids* for courses/resources.
 *
 * SAFETY MODEL (read before running):
 *   1. Dry-run by default. Nothing is written to Storyblok unless you pass --write.
 *   2. Writes are always drafts (publish: 0). This script NEVER publishes.
 *   3. GET → modify → PUT: we fetch the live story (including every existing
 *      *__i18n__<lang> key) and only ADD the new locale keys. Existing default
 *      content and other languages are preserved byte-for-byte.
 *   4. Translatable fields are discovered from the component SCHEMA (translatable:true),
 *      unioned with existing *__i18n__<refLang> siblings. The schema is authoritative, so
 *      fields never yet translated in any language (e.g. a newly added section) are still
 *      caught; the oracle additionally mirrors asset/url fields other languages localise.
 *      Schema-only fields are translated only when they hold text — assets/URLs are left alone.
 *   5. GAP-FILL (default): never clobber existing translations. A run COMPLETES what's missing —
 *      new fields get translated, and inside a rich-text field that's only partly translated, just
 *      the still-English leaves are translated in place (existing professional translations kept).
 *      --overwrite forces a full re-translation. Default target locales: all non-English locales.
 *   6. Course/session and short/conversation/video stories are refused (media not
 *      localised). Grounding/activities exercises ARE translatable and allowed.
 *   7. Every fetched story is snapshotted to disk before any write, and Storyblok
 *      keeps per-story version history, so rollback is always possible.
 *
 * USAGE:
 *   # 1. Pilot on ONE non-critical page, dry-run (writes proposed JSON to disk only):
 *   node scripts/translateStoryblok.mjs --slug meet-the-team
 *
 *   # 2. Inspect ./.storyblok-translation/meet-the-team.proposed.json, then write a DRAFT:
 *   node scripts/translateStoryblok.mjs --slug meet-the-team --write --yes
 *
 *   # 3. Review the draft in the Storyblok editor + RTL visual pass, then publish manually.
 *
 *   # Complete MISSING translations on every in-scope page in every language (gap-fill, dry-run):
 *   node scripts/translateStoryblok.mjs --all --include-policies
 *
 *   # Same but just German + French on two pages:
 *   node scripts/translateStoryblok.mjs --slug home,messaging --langs de,fr
 *
 * ENV (.env.local is auto-loaded if present):
 *   STORYBLOK_OAUTH_TOKEN   Management API (personal/space) token with write scope. REQUIRED.
 *   STORYBLOK_SPACE_ID      Numeric space id. REQUIRED.
 *   STORYBLOK_MAPI_BASE     Management API base. Default https://mapi.storyblok.com/v1
 *                           (EU — matches the api.storyblok.com delivery host this app uses).
 *   ANTHROPIC_API_KEY       Required when --engine api (the default).
 *   ANTHROPIC_MODEL         Default claude-opus-4-8.
 *
 * FLAGS:
 *   --slug <s>          Target one story by full slug. Repeatable / comma-separated.
 *   --all               Process the curated allowlist (excludes courses/resources & policies).
 *   --include-policies  Include policies/* (LEGAL — prefer professional translation; off by default).
 *   --langs de,fr,…     Target locales. Default: all non-English locales (de,fr,es,pt,hi,ar,tr).
 *   --ref-langs de,es,fr,hi,pt   Oracle locales for detecting translatable fields.
 *   --engine api|file   api = translate via Claude. file = export source strings for
 *                       human/Claude-in-the-loop and read back *.done.json. Default api.
 *   --write             Actually PUT to Storyblok (as DRAFT). Requires --yes.
 *   --report            Read-only audit: per story/locale, count remaining untranslated leaves
 *                       and divergent rich-text fields. Never calls a translation engine or writes.
 *   --report-sources    Like --report, but also lists each remaining source string (truncated).
 *                       Note: proper nouns, brand/partner names, language labels and English kept
 *                       by the Hinglish convention surface here as expected non-gaps.
 *   --yes               Confirm writes (guards against accidental --write).
 *   --overwrite         Re-translate fields that already have a target-locale value.
 *   --out <dir>         Output dir for snapshots/proposals/work files. Default .storyblok-translation
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..');

// ----------------------------- config & args ------------------------------

const RTL_LOCALES = new Set(['ar', 'ur', 'fa', 'he']);

// Stories we must never translate — media-bearing content whose video/audio is not
// available in these locales — by slug prefix…
const EXCLUDED_PREFIXES = ['courses/', 'videos/', 'shorts/', 'conversations/'];
// …and by content type / root component (defence in depth + catches anything not under
// the folders above). Covers courses, sessions and the media resource types.
// Grounding/activities EXERCISES live INLINE inside the `grounding`/`activities` `page`
// stories (accordion/row_column blocks), so they are translated as part of those pages;
// their embedded audio/video assets are left untouched.
const EXCLUDED_COMPONENTS = new Set([
  'course',
  'Course',
  'session',
  'Session',
  'session_iba',
  'week',
  'resource_short_video',
  'resource_single_video',
  'resource_conversation',
]);

// policies/* is legal content — included in --all only with --include-policies, and should
// go through professional/legal review before publishing.
const POLICIES_PREFIX = 'policies/';

// Every non-default locale the app supports (see i18n/routing.ts). Default target set, so a
// plain run completes missing translations in ALL languages. Override with --langs.
const DEFAULT_LANGS = ['de', 'fr', 'es', 'pt', 'hi', 'ar', 'tr'];

function parseArgs(argv) {
  const args = {
    slugs: [],
    all: false,
    includePolicies: false,
    langs: [...DEFAULT_LANGS],
    refLangs: ['de', 'es', 'fr', 'hi', 'pt'],
    engine: 'api',
    write: false,
    report: false,
    yes: false,
    overwrite: false,
    out: path.join(REPO_ROOT, '.storyblok-translation'),
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === '--slug')
      args.slugs.push(
        ...next()
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      );
    else if (a === '--all') args.all = true;
    else if (a === '--include-policies') args.includePolicies = true;
    else if (a === '--langs')
      args.langs = next()
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    else if (a === '--ref-langs')
      args.refLangs = next()
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    else if (a === '--engine') args.engine = next();
    else if (a === '--write') args.write = true;
    else if (a === '--report') args.report = true;
    else if (a === '--report-sources') {
      args.report = true;
      args.reportSources = true;
    }
    else if (a === '--yes') args.yes = true;
    else if (a === '--overwrite') args.overwrite = true;
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

// ----------------------------- Storyblok Management API ------------------------------

function mapiBase() {
  return (process.env.STORYBLOK_MAPI_BASE || 'https://mapi.storyblok.com/v1').replace(/\/$/, '');
}

// Personal access tokens authenticate with the raw token in the Authorization header;
// OAuth tokens need a "Bearer " prefix. Try raw first, fall back to Bearer on the first
// 401 and remember which worked so we only pay the retry once.
let _authPrefix = process.env.STORYBLOK_AUTH_SCHEME === 'bearer' ? 'Bearer ' : '';

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

  for (let attempt = 0; attempt < 5; attempt++) {
    let res = await send(_authPrefix);

    // One-time auth-scheme fallback: raw token ⇆ Bearer.
    if (res.status === 401 && _authPrefix === '') {
      const alt = await send('Bearer ');
      if (alt.ok) {
        _authPrefix = 'Bearer ';
        res = alt;
      } else {
        res = res; // keep original 401 for the message below
      }
    }

    if (res.status === 429) {
      const wait = 1000 * (attempt + 1);
      console.warn(`  rate limited, retrying in ${wait}ms…`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) {
      const text = await res.text();
      const hint =
        res.status === 401
          ? '\n  → 401 usually means STORYBLOK_OAUTH_TOKEN is not a Management API token. ' +
            'It must be a Personal access token (My Account → Personal access tokens) or OAuth token ' +
            'with access to this space — NOT the public delivery/preview token (the xB5Ho… one in the app). ' +
            'Also confirm STORYBLOK_SPACE_ID is the numeric id and the space is in the EU region ' +
            '(else set STORYBLOK_MAPI_BASE, e.g. https://api-us.storyblok.com/v1 for US).'
          : '';
      throw new Error(`Storyblok ${method} ${route} → ${res.status}: ${text}${hint}`);
    }
    return res.status === 204 ? null : res.json();
  }
  throw new Error(`Storyblok ${method} ${route} → too many rate-limit retries`);
}

async function findStoryIdBySlug(slug) {
  const data = await mapi('GET', `/stories?by_slugs=${encodeURIComponent(slug)}`);
  const match = (data.stories || []).find((s) => s.full_slug === slug || s.slug === slug);
  return match ? match.id : undefined;
}

async function getStory(id) {
  const data = await mapi('GET', `/stories/${id}`);
  return data.story;
}

async function listAllStories() {
  const out = [];
  for (let page = 1; page < 100; page++) {
    const data = await mapi('GET', `/stories?per_page=100&page=${page}`);
    const batch = data.stories || [];
    if (!batch.length) break;
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}

// Build { componentName: [translatableFieldNames] } from the space's component schemas.
// This is the AUTHORITATIVE source of what may be translated — it catches fields that
// are translatable but have never been translated in any reference language (which the
// existing-translation oracle alone would miss). Fetched once and cached.
let _schemaMapCache = null;
async function getComponentSchemaMap() {
  if (_schemaMapCache) return _schemaMapCache;
  const map = {};
  for (let page = 1; page < 100; page++) {
    const data = await mapi('GET', `/components?per_page=100&page=${page}`);
    const batch = data.components || [];
    if (!batch.length) break;
    for (const c of batch) {
      const fields = Object.entries(c.schema || {})
        .filter(([, def]) => def && def.translatable)
        .map(([name]) => name);
      if (fields.length) map[c.name] = fields;
    }
    if (batch.length < 100) break;
  }
  _schemaMapCache = map;
  return map;
}

// ----------------------------- translatable-field discovery + tree walk ------------------------------

const I18N = '__i18n__';

function isRichTextDoc(v) {
  return (
    v && typeof v === 'object' && !Array.isArray(v) && v.type === 'doc' && Array.isArray(v.content)
  );
}

function isUrlLike(s) {
  return /^(https?:)?\/\//i.test(s) || /^\/[\w-]/.test(s) || /^mailto:|^tel:/i.test(s);
}

function hasLetters(s) {
  // Translate only strings that contain letters (Latin or Arabic etc.). Skip pure
  // numbers / punctuation / option-values.
  return /\p{L}/u.test(s);
}

function isTranslatableText(s) {
  return typeof s === 'string' && s.trim() !== '' && hasLetters(s) && !isUrlLike(s);
}

// Remove every *__i18n__* key found INSIDE a rich-text doc (i.e. on bloks embedded within
// rich text). Storyblok renders embedded-in-richtext content from the PARENT field's
// __i18n__ copy, so such sibling keys are never read — and an earlier version of this
// script wrongly wrote them. Stripping them here both cleans that pollution (on --write)
// and keeps the inline copies we build below tidy.
function stripI18nWithinDocs(node, insideDoc = false) {
  if (Array.isArray(node)) {
    node.forEach((x) => stripI18nWithinDocs(x, insideDoc));
    return;
  }
  if (!node || typeof node !== 'object') return;
  const here = insideDoc || node.type === 'doc';
  if (here) {
    for (const k of Object.keys(node)) if (k.includes(I18N)) delete node[k];
  }
  for (const k of Object.keys(node)) {
    const v = node[k];
    if (v && typeof v === 'object') stripI18nWithinDocs(v, here);
  }
}

/**
 * Fully translate a rich-text doc clone IN PLACE for one locale: every text node, plus
 * every translatable string field of any component embedded within it (recursively into
 * nested bloks and their own rich-text fields). Embedded-in-richtext content renders from
 * the parent field's __i18n__ copy, so it MUST be translated inline here — sibling
 * __i18n__ keys on embedded bloks are ignored by Storyblok.
 */
function planDocInPlace(doc, lang, schemaMap, units) {
  const walk = (n) => {
    if (Array.isArray(n)) {
      n.forEach(walk);
      return;
    }
    if (!n || typeof n !== 'object') return;
    if (n.type === 'text' && isTranslatableText(n.text)) {
      units.push({ source: n.text, set: (v) => (n.text = v), lang });
    }
    const schemaFields =
      n.component && schemaMap[n.component] ? new Set(schemaMap[n.component]) : null;
    for (const k of Object.keys(n)) {
      if (k.includes(I18N)) continue;
      const v = n[k];
      if (schemaFields && schemaFields.has(k) && isTranslatableText(v)) {
        units.push({ source: v, set: (val) => (n[k] = val), lang });
      } else if (v && typeof v === 'object') {
        walk(v); // descend into content arrays, attrs.body, nested rich-text docs, etc.
      }
    }
  };
  walk(doc);
}

// Collect the translatable "leaves" of a rich-text doc in deterministic traversal order:
// every text node, plus every schema-translatable string field of any embedded component.
// The order mirrors planDocInPlace exactly, so the leaves of a default doc and of a copy that
// was cloned from it line up index-for-index.
function collectDocLeaves(doc, schemaMap) {
  const leaves = [];
  const walk = (n) => {
    if (Array.isArray(n)) {
      n.forEach(walk);
      return;
    }
    if (!n || typeof n !== 'object') return;
    if (n.type === 'text' && typeof n.text === 'string') {
      leaves.push({ get: () => n.text, set: (v) => (n.text = v) });
    }
    const schemaFields =
      n.component && schemaMap[n.component] ? new Set(schemaMap[n.component]) : null;
    for (const k of Object.keys(n)) {
      if (k.includes(I18N)) continue;
      const v = n[k];
      if (schemaFields && schemaFields.has(k) && typeof v === 'string') {
        leaves.push({ get: () => n[k], set: (val) => (n[k] = val) });
      } else if (v && typeof v === 'object') {
        walk(v);
      }
    }
  };
  walk(doc);
  return leaves;
}

// GAP-FILL: into an EXISTING rich-text __i18n__ copy, translate only the leaves that are still
// identical to the default (i.e. untranslated), leaving every already-translated leaf untouched.
// Returns true if the copy lined up with the default (safe to gap-fill), false if the structure
// diverged (default edited after translating) — the caller then leaves that field alone.
function planDocGapFill(defaultDoc, targetDoc, lang, schemaMap, units) {
  const defaultLeaves = collectDocLeaves(defaultDoc, schemaMap);
  const targetLeaves = collectDocLeaves(targetDoc, schemaMap);
  if (defaultLeaves.length !== targetLeaves.length) return false;
  for (let i = 0; i < defaultLeaves.length; i++) {
    const defaultValue = defaultLeaves[i].get();
    const stillUntranslated = targetLeaves[i].get() === defaultValue;
    if (isTranslatableText(defaultValue) && stillUntranslated) {
      const leaf = targetLeaves[i];
      units.push({ source: defaultValue, set: (v) => leaf.set(v), lang });
    }
  }
  return true;
}

/**
 * Walk a content object building translations. A base field is "translatable" if EITHER
 * the component schema marks it `translatable: true` (authoritative — catches fields never
 * translated in any language) OR a sibling `<base>__i18n__<refLang>` already exists (oracle
 * — mirrors what the other languages do, incl. asset/url fields they localise). Schema-only
 * fields are translated only when they hold text.
 *
 * Per target locale, for each translatable field:
 *   • no `__i18n__<lang>` yet  → create it (rich-text translated fully inline; string translated).
 *   • rich-text copy exists     → GAP-FILL: translate only the still-untranslated leaves in place,
 *                                 preserving every existing (e.g. professional) translation.
 *   • string copy exists        → leave it (already translated).
 *   • `--overwrite`             → recreate from scratch (re-translate everything).
 * This makes the script a safe, idempotent way to COMPLETE missing translations on any page in
 * any language without clobbering existing ones.
 *
 * Rich-text embedded content is always handled inline within the parent field's copy (Storyblok
 * renders it from there); we never recurse into rich-text docs for sibling translation.
 *
 * Returns { units, schemaOnlyFields, divergentFields }.
 */
function planTranslation(content, { langs, refLangs, overwrite, schemaMap = {} }) {
  const units = [];
  let schemaOnlyFields = 0;
  const divergentFields = [];

  stripI18nWithinDocs(content);

  const visit = (node, path) => {
    if (Array.isArray(node)) {
      node.forEach((x, i) => visit(x, `${path}[${i}]`));
      return;
    }
    if (!node || typeof node !== 'object') return;

    const baseKeys = Object.keys(node).filter((k) => !k.includes(I18N));
    const schemaFields =
      node.component && schemaMap[node.component] ? new Set(schemaMap[node.component]) : null;

    for (const key of baseKeys) {
      const byOracle = refLangs.some((l) => `${key}${I18N}${l}` in node);
      const bySchema = schemaFields ? schemaFields.has(key) : false;
      if (!byOracle && !bySchema) continue;
      const source = node[key];

      const isText = isRichTextDoc(source) || isTranslatableText(source);
      if (!byOracle && !isText) continue;
      if (!byOracle && bySchema) schemaOnlyFields++;

      for (const lang of langs) {
        const tkey = `${key}${I18N}${lang}`;
        const exists = tkey in node;

        if (exists && !overwrite) {
          // Complete an existing translation without clobbering it.
          if (isRichTextDoc(source) && isRichTextDoc(node[tkey])) {
            const ok = planDocGapFill(source, node[tkey], lang, schemaMap, units);
            if (!ok) divergentFields.push(`${path}.${key} (${lang})`);
          }
          continue; // string copies / fully-translated rich text: nothing to do
        }

        // Create (or, with --overwrite, recreate) the translation.
        if (isRichTextDoc(source)) {
          const cloned = structuredClone(source);
          node[tkey] = cloned;
          planDocInPlace(cloned, lang, schemaMap, units);
        } else if (typeof source === 'string') {
          if (!isTranslatableText(source)) {
            node[tkey] = source; // copy non-translatable string verbatim so the field exists
          } else {
            node[tkey] = source; // placeholder; overwritten by set() below
            units.push({ source, set: (v) => (node[tkey] = v), lang });
          }
        } else {
          node[tkey] = structuredClone(source); // non-string translatable field (rare)
        }
      }
    }

    // Recurse to reach components in real bloks fields — but NOT into rich-text docs
    // (their embedded content is translated inline above).
    for (const key of baseKeys) {
      const v = node[key];
      if (v && typeof v === 'object' && !isRichTextDoc(v)) visit(v, `${path}.${key}`);
    }
  };

  visit(content, '');
  return { units, schemaOnlyFields, divergentFields };
}

// ----------------------------- translation engines ------------------------------

const REGISTER = {
  ar:
    'Modern Standard Arabic. Gender-neutral, trauma-informed register: prefer nominal sentences, ' +
    'masdar/infinitive forms and the plural "we"; avoid gendered verb/pronoun forms. Use Western ' +
    '(Latin) digits. Right-to-left text — do not add directional control characters.',
  tr: 'Turkish. Warm, informal "sen" address throughout (never formal "siz").',
};

function translationSystemPrompt(lang) {
  return [
    `You are a professional ${lang === 'ar' ? 'Arabic' : lang === 'tr' ? 'Turkish' : lang} translator for Bloom,`,
    'a feminist, trauma-informed healing service by Chayn for survivors of gender-based violence.',
    REGISTER[lang] || `Translate naturally into locale "${lang}".`,
    'Rules:',
    '- Keep brand/legal names in Latin script unchanged: Bloom, Chayn, Bumble, Badoo, Fruitz, WhatsApp, Google Meet, SimplyBook.me, Meta.',
    '- Preserve ICU placeholders like {partnerName} and {hours} EXACTLY, untranslated.',
    '- Preserve any HTML/markdown markers and URLs exactly.',
    '- Translate each input string independently; do NOT merge, split, reorder, add, or drop strings.',
    '- Return ONLY a JSON array of strings, same length and order as the input. No commentary, no code fences.',
  ].join('\n');
}

async function translateBatchApi(strings, lang) {
  if (!strings.length) return [];
  const apiKey = required('ANTHROPIC_API_KEY');
  const model = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      system: translationSystemPrompt(lang),
      messages: [
        {
          role: 'user',
          content:
            `Translate these ${strings.length} strings into ${lang}. ` +
            `Return a JSON array of exactly ${strings.length} strings.\n\n` +
            JSON.stringify(strings, null, 0),
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  let text = (data.content || [])
    .map((b) => b.text || '')
    .join('')
    .trim();
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Anthropic returned non-JSON for lang ${lang}:\n${text.slice(0, 500)}`);
  }
  if (!Array.isArray(parsed) || parsed.length !== strings.length) {
    throw new Error(
      `Translation count mismatch for ${lang}: expected ${strings.length}, got ${Array.isArray(parsed) ? parsed.length : 'non-array'}`,
    );
  }
  return parsed.map(String);
}

// File engine: write source strings to <out>/<slug>.<lang>.todo.json. If a sibling
// <slug>.<lang>.done.json exists (same-length JSON array), use it; else leave untranslated.
function translateBatchFile(strings, lang, { outDir, slug }) {
  const safe = slug.replace(/[^\w.-]+/g, '_');
  fs.writeFileSync(
    path.join(outDir, `${safe}.${lang}.todo.json`),
    JSON.stringify(strings, null, 2),
  );
  const donePath = path.join(outDir, `${safe}.${lang}.done.json`);
  if (fs.existsSync(donePath)) {
    const done = JSON.parse(fs.readFileSync(donePath, 'utf8'));
    if (Array.isArray(done) && done.length === strings.length) return done.map(String);
    throw new Error(`${safe}.${lang}.done.json must be a JSON array of length ${strings.length}`);
  }
  return null; // not yet translated
}

// ----------------------------- per-story processing ------------------------------

function isExcluded(story) {
  const slug = story.full_slug || story.slug || '';
  if (EXCLUDED_PREFIXES.some((p) => slug.startsWith(p))) return `slug prefix "${slug}"`;
  const component = story.content && story.content.component;
  if (component && EXCLUDED_COMPONENTS.has(component)) return `component "${component}"`;
  return null;
}

async function processStory(slug, args) {
  console.log(`\n▸ ${slug}`);
  const id = await findStoryIdBySlug(slug);
  if (!id) {
    console.warn(`  ! not found — skipping`);
    return { slug, status: 'not-found' };
  }
  const story = await getStory(id);

  const excluded = isExcluded(story);
  if (excluded) {
    console.warn(`  ! refused (${excluded}) — media not localised for these locales`);
    return { slug, status: 'excluded' };
  }

  // Snapshot the live story BEFORE any mutation/write.
  const safe = slug.replace(/[^\w.-]+/g, '_');
  fs.writeFileSync(path.join(args.out, `${safe}.original.json`), JSON.stringify(story, null, 2));

  const schemaMap = await getComponentSchemaMap();
  const content = structuredClone(story.content);
  const { units, schemaOnlyFields, divergentFields } = planTranslation(content, {
    ...args,
    schemaMap,
  });
  if (schemaOnlyFields) {
    console.log(
      `  + ${schemaOnlyFields} field(s) translatable per schema but untranslated in all ` +
        `reference languages — now covered`,
    );
  }
  if (divergentFields && divergentFields.length) {
    console.warn(
      `  ! ${divergentFields.length} rich-text field(s) whose default changed since translating — ` +
        `gap-fill skipped (translate/re-sync manually or use --overwrite): ` +
        divergentFields.slice(0, 5).join('; ') +
        (divergentFields.length > 5 ? ' …' : ''),
    );
  }

  // Read-only gap report: count remaining untranslated leaves per language and stop.
  // Never calls a translation engine and never writes to Storyblok.
  if (args.report) {
    const perLang = new Map();
    for (const u of units) {
      if (!perLang.has(u.lang)) perLang.set(u.lang, []);
      perLang.get(u.lang).push(u.source);
    }
    if (!units.length && !(divergentFields && divergentFields.length)) {
      console.log(`  ✓ fully translated in ${args.langs.join(',')}`);
    } else {
      const gaps = [...perLang.entries()].map(([l, s]) => `${l}:${s.length}`).join('  ');
      if (gaps) console.log(`  gaps → ${gaps}`);
      if (args.reportSources) {
        for (const [l, s] of perLang) {
          for (const src of s) {
            const one = String(src).replace(/\s+/g, ' ').trim();
            console.log(`    [${l}] ${one.length > 90 ? one.slice(0, 90) + '…' : one}`);
          }
        }
      }
    }
    return {
      slug,
      status: units.length || divergentFields.length ? 'has-gaps' : 'complete',
      gaps: Object.fromEntries(perLang),
      divergent: divergentFields.length,
    };
  }

  if (!units.length) {
    console.log(`  no translatable fields needing work (all present or none translatable).`);
    return { slug, status: 'nothing-to-do' };
  }

  // Group units by language, translate each batch, reinsert.
  const byLang = new Map();
  for (const u of units) {
    if (!byLang.has(u.lang)) byLang.set(u.lang, []);
    byLang.get(u.lang).push(u);
  }

  let translatedAny = false;
  for (const [lang, group] of byLang) {
    const sources = group.map((u) => u.source);
    let results;
    if (args.engine === 'file') {
      results = translateBatchFile(sources, lang, { outDir: args.out, slug });
      if (!results) {
        console.log(
          `  [${lang}] ${sources.length} strings → wrote ${safe}.${lang}.todo.json (awaiting .done.json)`,
        );
        continue;
      }
    } else {
      console.log(`  [${lang}] translating ${sources.length} strings via Claude…`);
      results = await translateBatchApi(sources, lang);
    }
    group.forEach((u, i) => u.set(results[i]));
    translatedAny = true;
    console.log(`  [${lang}] applied ${group.length} translations`);
  }

  // Write the proposed full content for inspection.
  fs.writeFileSync(
    path.join(args.out, `${safe}.proposed.json`),
    JSON.stringify({ story: { content } }, null, 2),
  );

  if (!translatedAny) {
    console.log(`  proposed content not written to Storyblok (file engine, translations pending).`);
    return { slug, status: 'pending-file-translation' };
  }

  if (!args.write) {
    console.log(
      `  DRY-RUN — proposed JSON at .storyblok-translation/${safe}.proposed.json (no write)`,
    );
    return { slug, status: 'dry-run' };
  }

  // WRITE as draft. publish:0 → updates the draft only; the published version is untouched.
  await mapi('PUT', `/stories/${id}`, { story: { content }, publish: 0 });
  console.log(`  ✓ wrote DRAFT to Storyblok (publish:0). Review in the editor before publishing.`);
  return { slug, status: 'written-draft' };
}

// ----------------------------- main ------------------------------

function required(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return v;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function resolveTargetSlugs(args) {
  if (args.slugs.length) return args.slugs;
  if (!args.all) {
    console.error('Specify --slug <slug> (recommended for the first run) or --all.');
    process.exit(1);
  }
  console.log('Listing all stories (everything except media/excluded content)…');
  const all = await listAllStories();
  const slugs = [];
  for (const s of all) {
    const slug = s.full_slug;
    if (!slug || s.is_folder) continue;
    if (EXCLUDED_PREFIXES.some((p) => slug.startsWith(p))) continue;
    if (EXCLUDED_COMPONENTS.has(s.content_type)) continue;
    if (slug.startsWith(POLICIES_PREFIX)) {
      if (args.includePolicies) slugs.push(slug);
      continue;
    }
    slugs.push(slug);
  }
  return slugs;
}

async function main() {
  loadDotEnv();
  const args = parseArgs(process.argv.slice(2));

  if (args.write && !args.yes) {
    console.error('--write requires --yes (safety confirmation). Aborting.');
    process.exit(1);
  }
  if (args.langs.some((l) => RTL_LOCALES.has(l))) {
    console.log('Note: RTL target locale(s) present — the app handles direction automatically.');
  }

  fs.mkdirSync(args.out, { recursive: true });

  const slugs = await resolveTargetSlugs(args);
  if (!slugs.length) {
    console.error('No target stories resolved.');
    process.exit(1);
  }

  console.log(
    `\nMode: ${args.write ? 'WRITE (draft)' : 'DRY-RUN'} | engine: ${args.engine} | ` +
      `langs: ${args.langs.join(',')} | stories: ${slugs.length}`,
  );
  if (args.includePolicies) {
    console.log(
      '⚠️  policies/* included — legal content. Prefer professional/legal translation; review carefully.',
    );
  }

  const results = [];
  for (const slug of slugs) {
    try {
      results.push(await processStory(slug, args));
    } catch (err) {
      console.error(`  ✗ error: ${err.message}`);
      results.push({ slug, status: 'error', error: err.message });
    }
  }

  console.log('\n──────── summary ────────');
  for (const r of results) console.log(`  ${r.status.padEnd(24)} ${r.slug}`);
  const wrote = results.filter((r) => r.status === 'written-draft').length;
  console.log(
    `\n${wrote} story(ies) written as draft. ${args.write ? '' : '(dry-run — nothing written)'}`,
  );
  console.log(`Artifacts in ${path.relative(REPO_ROOT, args.out)}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
