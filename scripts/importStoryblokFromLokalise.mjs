#!/usr/bin/env node
/**
 * importStoryblokFromLokalise.mjs — take the JSON you exported from Lokalise (after editing
 * / QA) and write the changed translations back into Storyblok, using the manifest.json
 * produced by exportStoryblokToLokalise.mjs to place every string precisely.
 *
 * SAFETY MODEL:
 *   1. Dry-run by default. Nothing is written unless you pass --write --yes.
 *   2. Writes are DRAFTS (publish: 0). Add --publish to publish the stories it changed.
 *   3. Language-scoped: only ever writes `<field>__i18n__<lang>` — the English source and
 *      every other locale are preserved byte-for-byte.
 *   4. Source-drift guard: before touching a field, the live English is compared against the
 *      snapshot in the manifest. If it changed (someone edited the page since export), the
 *      whole field is SKIPPED and reported — never mis-applied.
 *   5. Placeholder guard: an incoming value is skipped if it doesn't carry the same
 *      {placeholder} tokens as the English source.
 *   6. No-op and blank values are skipped. Each story is snapshotted to
 *      .storyblok-translation/<slug>.beforeimport.json before it is written.
 *
 * INPUT — one JSON file per language, keys exactly as exported (flat, or Lokalise
 * "Structured JSON" with {"translation": …}). Put them in a folder and point --in at it:
 *   ./storyblok-lokalise/incoming/tr.json
 *   ./storyblok-lokalise/incoming/ar.json
 *
 * USAGE:
 *   node scripts/importStoryblokFromLokalise.mjs --in ./storyblok-lokalise/incoming            # dry-run
 *   node scripts/importStoryblokFromLokalise.mjs --in ./storyblok-lokalise/incoming --write --yes
 *   node scripts/importStoryblokFromLokalise.mjs --in ./storyblok-lokalise/incoming --write --yes --publish
 *   node scripts/importStoryblokFromLokalise.mjs --file tr=./tr.json --slug home --write --yes
 *
 * ENV (.env.local auto-loaded): STORYBLOK_OAUTH_TOKEN, STORYBLOK_SPACE_ID, [STORYBLOK_MAPI_BASE]
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  REPO_ROOT,
  I18N,
  KEY_DELIM,
  loadDotEnv,
  mapi,
  getStory,
  publishStory,
  getComponentSchemaMap,
  collectRichTextLeaves,
  placeholdersIn,
  fieldKeyOf,
  findByUid,
  ensureDir,
  readJson,
} from './storyblokLokalise.lib.mjs';

function parseArgs(argv) {
  const args = {
    manifest: path.join(REPO_ROOT, 'storyblok-lokalise', 'manifest.json'),
    in: '',
    files: {}, // lang -> path
    langs: [],
    slugs: [],
    write: false,
    yes: false,
    publish: false,
    overwriteDivergent: false,
    out: path.join(REPO_ROOT, '.storyblok-translation'),
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === '--manifest') args.manifest = path.resolve(next());
    else if (a === '--in') args.in = path.resolve(next());
    else if (a === '--file') {
      const v = next();
      const eq = v.indexOf('=');
      if (eq === -1) {
        console.error('--file expects <lang>=<path>');
        process.exit(1);
      }
      args.files[v.slice(0, eq).trim()] = path.resolve(v.slice(eq + 1).trim());
    } else if (a === '--langs')
      args.langs = next()
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    else if (a === '--slug')
      args.slugs.push(
        ...next()
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      );
    else if (a === '--write') args.write = true;
    else if (a === '--yes') args.yes = true;
    else if (a === '--publish') args.publish = true;
    else if (a === '--overwrite-divergent') args.overwriteDivergent = true;
    else if (a === '--out') args.out = path.resolve(next());
    else if (a === '--help' || a === '-h') {
      console.log('See the header of this file.');
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${a}`);
      process.exit(1);
    }
  }
  return args;
}

/** Flatten a Lokalise JSON export to { key: string }. Accepts plain `{key: "…"}`,
 *  Structured JSON `{key: {translation: "…"}}`, and (defensively) nested objects —
 *  if Lokalise ever nests, the path is re-joined with our delimiter. */
function flattenLokalise(obj) {
  const out = {};
  const isLeafObj = (v) => v && typeof v === 'object' && typeof v.translation === 'string';
  const walk = (node, prefix) => {
    if (typeof node === 'string') {
      if (prefix) out[prefix] = node;
      return;
    }
    if (isLeafObj(node)) {
      out[prefix] = node.translation;
      return;
    }
    if (node && typeof node === 'object' && !Array.isArray(node)) {
      for (const k of Object.keys(node)) walk(node[k], prefix ? `${prefix}${KEY_DELIM}${k}` : k);
    }
  };
  walk(obj, '');
  return out;
}

function loadIncoming(args, manifestLangs) {
  const langs = args.langs.length ? args.langs : manifestLangs;
  const result = {};
  for (const lang of langs) {
    let file = args.files[lang];
    if (!file && args.in) {
      const cand = path.join(args.in, `${lang}.json`);
      if (fs.existsSync(cand)) file = cand;
    }
    if (!file) {
      console.warn(`  (no input file for "${lang}" — skipping)`);
      continue;
    }
    result[lang] = flattenLokalise(readJson(file));
    console.log(
      `  ${lang}: ${Object.keys(result[lang]).length} keys ← ${path.relative(REPO_ROOT, file)}`,
    );
  }
  return result;
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Strip stray *__i18n__* keys inside a rich-text doc (Storyblok ignores them; keep clones clean).
function stripI18nWithinDoc(node) {
  if (Array.isArray(node)) return node.forEach(stripI18nWithinDoc);
  if (!node || typeof node !== 'object') return;
  for (const k of Object.keys(node)) if (k.includes(I18N)) delete node[k];
  for (const k of Object.keys(node))
    if (node[k] && typeof node[k] === 'object') stripI18nWithinDoc(node[k]);
}

async function main() {
  loadDotEnv();
  const args = parseArgs(process.argv.slice(2));
  if (args.write && !args.yes) {
    console.error('--write requires --yes (safety confirmation). Aborting.');
    process.exit(1);
  }
  if (!args.in && !Object.keys(args.files).length) {
    console.error('Provide --in <dir> or --file <lang>=<path>.');
    process.exit(1);
  }
  const manifest = readJson(args.manifest);
  ensureDir(args.out);

  console.log(
    `Mode: ${args.write ? 'WRITE (draft)' : 'DRY-RUN'}${args.publish ? ' + PUBLISH' : ''}`,
  );
  console.log(
    `Manifest: ${path.relative(REPO_ROOT, args.manifest)}  (${Object.keys(manifest.segments).length} segments)`,
  );
  const incoming = loadIncoming(args, manifest.langs);
  const langs = Object.keys(incoming);
  if (!langs.length) {
    console.error('No input files loaded.');
    process.exit(1);
  }
  const schemaMap = await getComponentSchemaMap();

  // Which stories are touched? And which incoming keys aren't in the manifest at all?
  const wantSlugs = new Set();
  const unknownKeys = new Set();
  let totalIncoming = 0;
  let matchedIncoming = 0;
  for (const lang of langs) {
    for (const key of Object.keys(incoming[lang])) {
      totalIncoming++;
      const seg = manifest.segments[key];
      if (!seg) {
        unknownKeys.add(`[${lang}] ${key}`);
        continue;
      }
      matchedIncoming++;
      if (args.slugs.length && !args.slugs.includes(seg.slug)) continue;
      wantSlugs.add(seg.slug);
    }
  }
  const matchRate = totalIncoming ? matchedIncoming / totalIncoming : 0;
  if (totalIncoming && matchedIncoming === 0) {
    console.error(
      `\n✗ 0 of ${totalIncoming} incoming keys matched this manifest.\n` +
        `  The Lokalise export probably nested the keys (download as "JSON flat", with no key\n` +
        `  separator / nesting option), keys were renamed, or this manifest is from a different\n` +
        `  export. Nothing was written. Compare a sample key:\n` +
        `    incoming: ${Object.keys(incoming[langs[0]])[0]}\n` +
        `    manifest: ${Object.keys(manifest.segments)[0]}`,
    );
    process.exit(1);
  }
  if (totalIncoming && matchRate < 0.5) {
    console.warn(
      `\n⚠  Only ${matchedIncoming}/${totalIncoming} incoming keys are in the manifest ` +
        `(${Math.round(matchRate * 100)}%). Fine for a partial export; otherwise check the ` +
        `"not in the manifest" list below.`,
    );
  }

  const tally = { write: 0, blank: 0, noop: 0, unknownKey: unknownKeys.size };
  const skips = []; // { lang, key, reason, detail }
  const touched = []; // { slug, id }

  for (const slug of [...wantSlugs].sort()) {
    const storyMeta = manifest.stories[slug];
    const story = await getStory(storyMeta.storyId);
    if (story.unpublished_changes) {
      console.log(`\n▸ ${slug}  ⚠ has unpublished changes — importing onto the current draft`);
    } else {
      console.log(`\n▸ ${slug}`);
    }
    const content = story.content;
    let changed = false;

    // group incoming keys for this story by field
    const byField = new Map(); // fieldKey -> [{lang,key,seg}]
    for (const lang of langs) {
      for (const [key, rawVal] of Object.entries(incoming[lang])) {
        const seg = manifest.segments[key];
        if (!seg || seg.slug !== slug) continue;
        if (args.slugs.length && !args.slugs.includes(slug)) continue;
        const fieldKey = fieldKeyOf(seg.slug, seg.ownerUid, seg.field);
        if (!byField.has(fieldKey)) byField.set(fieldKey, []);
        byField.get(fieldKey).push({ lang, key, seg, val: rawVal });
      }
    }

    for (const [fieldKey, entries] of byField) {
      const mf = manifest.fields[fieldKey];
      if (!mf) {
        for (const e of entries)
          skips.push({ lang: e.lang, key: e.key, reason: 'field-not-in-manifest' });
        continue;
      }
      const owner = findByUid(content, mf.ownerUid);
      if (!owner) {
        for (const e of entries)
          skips.push({
            lang: e.lang,
            key: e.key,
            reason: 'owner-blok-missing',
            detail: mf.ownerUid,
          });
        continue;
      }

      if (mf.kind === 'string') {
        const liveSource = owner[mf.field];
        if (liveSource !== mf.source) {
          for (const e of entries)
            skips.push({
              lang: e.lang,
              key: e.key,
              reason: 'source-changed',
              detail: `was ${JSON.stringify(mf.source)} · now ${JSON.stringify(liveSource)}`,
            });
          continue;
        }
        for (const e of entries) {
          const val = typeof e.val === 'string' ? e.val : '';
          if (!val.trim()) {
            tally.blank++;
            continue;
          }
          if (!same(placeholdersIn(val).sort(), placeholdersIn(mf.source).sort())) {
            skips.push({ lang: e.lang, key: e.key, reason: 'placeholder-mismatch', detail: val });
            continue;
          }
          const tk = `${mf.field}${I18N}${e.lang}`;
          if (owner[tk] === val) {
            tally.noop++;
            continue;
          }
          owner[tk] = val;
          tally.write++;
          changed = true;
        }
        continue;
      }

      // rich text
      const liveLeaves = collectRichTextLeaves(owner[mf.field], schemaMap);
      const lengthOk = liveLeaves.length === mf.leaves.length;
      const contentOk = lengthOk && mf.leaves.every((s, i) => liveLeaves[i].get() === s);
      if (!contentOk) {
        const firstDiff = lengthOk ? mf.leaves.findIndex((s, i) => liveLeaves[i].get() !== s) : -1;
        for (const e of entries)
          skips.push({
            lang: e.lang,
            key: e.key,
            reason: 'source-changed',
            detail: lengthOk
              ? `leaf ${firstDiff}: was ${JSON.stringify(mf.leaves[firstDiff])} · now ${JSON.stringify(liveLeaves[firstDiff]?.get())}`
              : `leaf count ${mf.leaves.length} → ${liveLeaves.length}`,
          });
        continue;
      }

      // per language: ensure the __i18n__ doc exists and lines up, then set leaves
      const byLang = new Map();
      for (const e of entries) {
        if (!byLang.has(e.lang)) byLang.set(e.lang, []);
        byLang.get(e.lang).push(e);
      }
      for (const [lang, es] of byLang) {
        const tk = `${mf.field}${I18N}${lang}`;
        if (!(tk in owner)) {
          const clone = structuredClone(owner[mf.field]);
          stripI18nWithinDoc(clone);
          owner[tk] = clone;
          changed = true;
        }
        let tgtLeaves = collectRichTextLeaves(owner[tk], schemaMap);
        if (tgtLeaves.length !== liveLeaves.length) {
          if (args.overwriteDivergent) {
            const clone = structuredClone(owner[mf.field]);
            stripI18nWithinDoc(clone);
            owner[tk] = clone;
            tgtLeaves = collectRichTextLeaves(owner[tk], schemaMap);
            changed = true;
          } else {
            for (const e of es)
              skips.push({
                lang,
                key: e.key,
                reason: 'existing-translation-divergent',
                detail: `${lang} copy has ${tgtLeaves.length} leaves, source has ${liveLeaves.length} — pass --overwrite-divergent to re-clone (loses existing ${lang} edits in this field)`,
              });
            continue;
          }
        }
        for (const e of es) {
          const val = typeof e.val === 'string' ? e.val : '';
          const li = e.seg.leafIndex;
          if (!val.trim()) {
            tally.blank++;
            continue;
          }
          if (!same(placeholdersIn(val).sort(), placeholdersIn(mf.leaves[li]).sort())) {
            skips.push({ lang, key: e.key, reason: 'placeholder-mismatch', detail: val });
            continue;
          }
          if (tgtLeaves[li].get() === val) {
            tally.noop++;
            continue;
          }
          tgtLeaves[li].set(val);
          tally.write++;
          changed = true;
        }
      }
    }

    if (!changed) {
      console.log('  nothing to change');
      continue;
    }

    const safe = slug.replace(/[^\w.-]+/g, '_');
    fs.writeFileSync(
      path.join(args.out, `${safe}.beforeimport.json`),
      JSON.stringify(story, null, 2),
    );

    if (args.write) {
      await mapi('PUT', `/stories/${storyMeta.storyId}`, { story: { content }, publish: 0 });
      console.log('  ✓ wrote DRAFT (publish:0)');
      touched.push({ slug, id: storyMeta.storyId });
    } else {
      console.log('  DRY-RUN — would write draft');
    }
  }

  if (args.write && args.publish && touched.length) {
    console.log('\nPublishing changed stories…');
    for (const t of touched) {
      await publishStory(t.id);
      console.log(`  ✓ published ${t.slug}`);
    }
  }

  // ---- report ----
  console.log('\n──────── summary ────────');
  console.log(
    `written: ${tally.write}   no-op: ${tally.noop}   blank: ${tally.blank}   ` +
      `unknown key: ${tally.unknownKey}   skipped: ${skips.length}`,
  );
  if (unknownKeys.size) {
    console.log(
      `\nKeys not in the manifest (${unknownKeys.size}) — export may be stale, or keys renamed in Lokalise:`,
    );
    for (const k of [...unknownKeys].slice(0, 20)) console.log(`  ${k}`);
    if (unknownKeys.size > 20) console.log(`  … +${unknownKeys.size - 20} more`);
  }
  if (skips.length) {
    console.log('\nSkipped (needs a human):');
    const byReason = {};
    for (const s of skips) (byReason[s.reason] ||= []).push(s);
    for (const [reason, list] of Object.entries(byReason)) {
      console.log(`\n  ${reason} — ${list.length}`);
      for (const s of list.slice(0, 20)) {
        console.log(`    [${s.lang}] ${s.key}${s.detail ? `\n        ${s.detail}` : ''}`);
      }
      if (list.length > 20) console.log(`    … +${list.length - 20} more`);
    }
  }
  if (!args.write) console.log('\nDry-run only. Re-run with --write --yes to apply as drafts.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
