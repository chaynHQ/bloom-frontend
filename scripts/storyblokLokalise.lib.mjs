/**
 * storyblokLokalise.lib.mjs — shared primitives for the Storyblok ⇄ Lokalise round-trip.
 *
 * Used by:
 *   • exportStoryblokToLokalise.mjs   — Storyblok → Lokalise-ready JSON + manifest
 *   • importStoryblokFromLokalise.mjs — edited Lokalise JSON + manifest → Storyblok drafts
 *
 * The two scripts MUST agree, byte-for-byte, on:
 *   • which stories are in scope,
 *   • which fields are translatable,
 *   • the deterministic order of rich-text "leaves" inside a field,
 *   • the key format.
 * That agreement lives here so it cannot drift between export and import.
 *
 * Storyblok field-level i18n model (same as scripts/translateStoryblok.mjs):
 *   • A translatable field `foo` stores translations in a sibling key `foo__i18n__<lang>`.
 *   • For a rich-text field the whole `doc` tree is cloned into `foo__i18n__<lang>` and the
 *     text is translated inline. Content embedded in rich text (accordions, quotes, …) is
 *     rendered from that parent copy — NOT from `__i18n__` keys on the embedded bloks — so
 *     every embedded translatable string is just another leaf of the parent field.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.join(__dirname, '..');

export const I18N = '__i18n__';
export const KEY_DELIM = '::';

/** Every locale Bloom supports except the English source (see i18n/routing.ts). */
export const ALL_LANGS = ['de', 'fr', 'es', 'pt', 'hi', 'ar', 'tr'];

/* ----------------------------- scope ----------------------------- */

// Media-bearing content whose video/audio is not localised for these locales. Excluded by
// slug prefix AND by root component (defence in depth). Mirrors translateStoryblok.mjs.
// `activity/` and `grounding/` exercises ARE in scope — their embedded audio just falls
// back to English.
export const EXCLUDED_PREFIXES = ['courses/', 'video/', 'audio/', 'written/'];
export const EXCLUDED_COMPONENTS = new Set([
  'course',
  'Course',
  'session',
  'Session',
  'session_iba',
  'week',
  'resource_video',
  'resource_audio',
  'resource_written',
]);

export function isStoryExcluded(story) {
  const slug = story.full_slug || story.slug || '';
  if (EXCLUDED_PREFIXES.some((p) => slug.startsWith(p))) return `slug prefix "${slug}"`;
  const ct = story.content_type || (story.content && story.content.component);
  if (ct && EXCLUDED_COMPONENTS.has(ct)) return `component "${ct}"`;
  return null;
}

/* ----------------------------- env + Management API ----------------------------- */

export function loadDotEnv() {
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function mapiBase() {
  return (process.env.STORYBLOK_MAPI_BASE || 'https://mapi.storyblok.com/v1').replace(/\/$/, '');
}

// Personal access tokens use the raw token; OAuth tokens need "Bearer ". Try raw, fall back
// to Bearer once on a 401, remember which worked. Retry on 429.
let _authPrefix = process.env.STORYBLOK_AUTH_SCHEME === 'bearer' ? 'Bearer ' : '';

export async function mapi(method, route, body) {
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
    let res = await send(_authPrefix);
    if (res.status === 401 && _authPrefix === '') {
      const alt = await send('Bearer ');
      if (alt.ok) {
        _authPrefix = 'Bearer ';
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
          ? '\n  → 401 usually means STORYBLOK_OAUTH_TOKEN is not a Management API token ' +
            '(Personal access token / OAuth with write scope for this space), or the space is not EU ' +
            '(set STORYBLOK_MAPI_BASE, e.g. https://api-us.storyblok.com/v1).'
          : '';
      throw new Error(`Storyblok ${method} ${route} → ${res.status}: ${text}${hint}`);
    }
    return res.status === 204 ? null : res.json();
  }
  throw new Error(`Storyblok ${method} ${route} → too many rate-limit retries`);
}

export async function listAllStories() {
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

export async function getStory(id) {
  const { story } = await mapi('GET', `/stories/${id}`);
  return story;
}

export async function publishStory(id) {
  return mapi('GET', `/stories/${id}/publish`);
}

/** { componentName: Set(translatableFieldNames) } from the space component schemas. */
export async function getComponentSchemaMap() {
  const map = {};
  for (let page = 1; page < 100; page++) {
    const data = await mapi('GET', `/components?per_page=100&page=${page}`);
    const batch = data.components || [];
    if (!batch.length) break;
    for (const c of batch) {
      const fields = Object.entries(c.schema || {})
        .filter(([, def]) => def && def.translatable)
        .map(([name]) => name);
      if (fields.length) map[c.name] = new Set(fields);
    }
    if (batch.length < 100) break;
  }
  return map;
}

/* ----------------------------- text classification ----------------------------- */

export function isRichTextDoc(v) {
  return (
    v && typeof v === 'object' && !Array.isArray(v) && v.type === 'doc' && Array.isArray(v.content)
  );
}

function isUrlLike(s) {
  return /^(https?:)?\/\//i.test(s) || /^\/[\w-]/.test(s) || /^mailto:|^tel:/i.test(s);
}

/** A string worth sending to a translator: has letters, isn't a URL / bare number / colour. */
export function isTranslatableText(s) {
  return typeof s === 'string' && s.trim() !== '' && /\p{L}/u.test(s) && !isUrlLike(s);
}

/** ICU-ish placeholder tokens like {partnerName}. Must survive translation verbatim. */
export function placeholdersIn(s) {
  return typeof s === 'string' ? [...s.matchAll(/\{[a-zA-Z][\w]*\}/g)].map((m) => m[0]) : [];
}

/* ----------------------------- rich-text leaf walk ----------------------------- */

const BLOCK_TYPES = new Set(['paragraph', 'heading', 'blockquote', 'list_item', 'code_block']);

/**
 * Ordered, enriched leaves of a rich-text doc. Order MUST match translateStoryblok.mjs's
 * collectDocLeaves exactly (text node, then each schema-translatable string field of an
 * embedded component, recursing into nested objects / nested rich-text).
 *
 * Each leaf: { get(), set(v), blockText } — blockText is the plain text of the nearest
 * enclosing block (paragraph/heading/list item), used as translator context for fragments
 * that a link or bold mark split off the sentence.
 */
export function collectRichTextLeaves(doc, schemaMap) {
  const leaves = [];

  const blockPlainText = (blockNode) => {
    let s = '';
    (function t(n) {
      if (Array.isArray(n)) return n.forEach(t);
      if (!n || typeof n !== 'object') return;
      if (n.type === 'text' && typeof n.text === 'string') s += n.text;
      if (Array.isArray(n.content)) n.content.forEach(t);
    })(blockNode);
    return s.trim();
  };

  const walk = (n, block) => {
    if (Array.isArray(n)) return n.forEach((x) => walk(x, block));
    if (!n || typeof n !== 'object') return;

    const here = n.type && BLOCK_TYPES.has(n.type) ? n : block;

    if (n.type === 'text' && typeof n.text === 'string') {
      const b = here && here !== block ? blockPlainText(here) : here ? blockPlainText(here) : '';
      leaves.push({ get: () => n.text, set: (v) => (n.text = v), blockText: b });
    }

    const schemaFields = n.component && schemaMap[n.component] ? schemaMap[n.component] : null;

    for (const k of Object.keys(n)) {
      if (k.includes(I18N)) continue;
      const v = n[k];
      if (schemaFields && schemaFields.has(k) && typeof v === 'string') {
        leaves.push({ get: () => n[k], set: (val) => (n[k] = val), blockText: '' });
      } else if (v && typeof v === 'object') {
        walk(v, here);
      }
    }
  };

  walk(doc, null);
  return leaves;
}

/* ----------------------------- translatable-field discovery ----------------------------- */

/**
 * Walk a story's content and yield every translatable FIELD (not leaf). A base field `key`
 * is translatable if the owning component's schema marks it translatable OR a sibling
 * `key__i18n__<refLang>` already exists.
 *
 * Yields: {
 *   ownerUid,            // _uid of the blok that owns the field (stable anchor)
 *   uidPath,             // [_uid, …] from content root to the owner (for debugging)
 *   field,               // field name
 *   value,               // the base (English) value: string | rich-text doc
 *   kind,                // 'string' | 'richtext' | 'non-text'
 *   i18n,                // { <lang>: <the key `field__i18n__<lang>` value, or undefined> }
 *   ownerNode,           // live reference to the owner node (import uses this to write)
 * }
 *
 * Recursion enters `bloks`/object fields but never a rich-text doc (its content is handled
 * as leaves of that one field).
 */
export function* iterTranslatableFields(content, schemaMap, refLangs = ALL_LANGS) {
  function* visit(node, uidPath) {
    if (Array.isArray(node)) {
      for (const x of node) yield* visit(x, uidPath);
      return;
    }
    if (!node || typeof node !== 'object') return;

    const nextPath = node._uid ? [...uidPath, node._uid] : uidPath;
    const ownerUid = node._uid || uidPath[uidPath.length - 1];
    const baseKeys = Object.keys(node).filter((k) => !k.includes(I18N));
    const schemaFields =
      node.component && schemaMap[node.component] ? schemaMap[node.component] : null;

    for (const key of baseKeys) {
      const byOracle = refLangs.some((l) => `${key}${I18N}${l}` in node);
      const bySchema = schemaFields ? schemaFields.has(key) : false;
      if (!byOracle && !bySchema) continue;

      const value = node[key];
      let kind;
      if (isRichTextDoc(value)) kind = 'richtext';
      else if (isTranslatableText(value)) kind = 'string';
      else kind = 'non-text';

      // Skip schema-only fields that hold no translatable text (assets, urls, empty strings).
      if (kind === 'non-text' && !byOracle) continue;

      const i18n = {};
      for (const l of refLangs) {
        const tk = `${key}${I18N}${l}`;
        if (tk in node) i18n[l] = node[tk];
      }

      yield { ownerUid, uidPath: nextPath, field: key, value, kind, i18n, ownerNode: node };
    }

    for (const key of baseKeys) {
      const v = node[key];
      if (v && typeof v === 'object' && !isRichTextDoc(v)) yield* visit(v, nextPath);
    }
  }
  yield* visit(content, []);
}

/* ----------------------------- keys ----------------------------- */

/** Stable, human-readable key. Anchored on the owner blok's _uid so it survives
 *  sibling reordering. `<slug>::<ownerUid>::<field>[::<leafIndex>]`
 *  (The inverse mapping is not by parsing the key — `manifest.json` records every
 *  key's slug / ownerUid / field / leafIndex explicitly.) */
export function segmentKey({ slug, ownerUid, field, leafIndex }) {
  const base = [slug, ownerUid, field].join(KEY_DELIM);
  return leafIndex == null ? base : `${base}${KEY_DELIM}${leafIndex}`;
}

/* ----------------------------- misc ----------------------------- */

/** Deep-find a node by _uid, ignoring `*__i18n__*` subtrees (so we hit the canonical
 *  owner, not a clone inside a translated rich-text doc). */
export function findByUid(root, uid) {
  let found = null;
  (function walk(node) {
    if (found || !node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(walk);
    if (node._uid === uid) {
      found = node;
      return;
    }
    for (const k of Object.keys(node)) {
      if (k.includes(I18N)) continue;
      walk(node[k]);
    }
  })(root);
  return found;
}

export function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

export function writeJson(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n');
}

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
