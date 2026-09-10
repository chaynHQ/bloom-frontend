#!/usr/bin/env node
/**
 * exportStoryblokToLokalise.mjs — export every TRANSLATED (and to-be-translated) string
 * from the in-scope Storyblok stories into Lokalise-ready JSON + a manifest that lets
 * importStoryblokFromLokalise.mjs put edited translations back precisely.
 *
 * SCOPE (see storyblokLokalise.lib.mjs): grounding pages + grounding exercises, activity
 * exercises, home, welcome/*, meet-the-team, messaging, subscription/whatsapp,
 * therapy/book-session, policies/terms-of-service. EXCLUDES courses / sessions / videos /
 * audios / written (media not localised for these locales).
 *
 * OUTPUT (default ./storyblok-lokalise/):
 *   en.json               flat  { "<key>": "<English source>" }        ← Lokalise base language
 *   tr.json, ar.json      flat  { "<key>": "<current translation | ''>" }
 *   keys-structured.json  Lokalise "Structured JSON": { key: { translation, notes, tags } }
 *                         — optional richer base upload (adds sentence context + per-page tags)
 *   manifest.json         the CONTRACT: key → exact Storyblok location + source snapshot.
 *                         Commit this. importStoryblokFromLokalise.mjs needs it verbatim.
 *   UNTRANSLATED.md       human report of what is still missing, per language, per story.
 *   README.md             pointer to docs/storyblok-lokalise-roundtrip.md
 *
 * KEY FORMAT:  <full_slug>|<ownerBlokUid>|<field>[|<leafIndex>]
 *   • delimiter is "|" — Lokalise splits "::" into nested keys, which would break the mapping.
 *   • ownerBlokUid = _uid of the blok holding the field → survives sibling reordering.
 *   • leafIndex    = 0-based position of a text node in the field's rich-text (deterministic,
 *                    matches translateStoryblok.mjs). Absent for plain string fields.
 *
 * This script is READ-ONLY against Storyblok. It never writes.
 *
 * USAGE:
 *   node scripts/exportStoryblokToLokalise.mjs                 # all in-scope stories, tr+ar
 *   node scripts/exportStoryblokToLokalise.mjs --slug home,meet-the-team
 *   node scripts/exportStoryblokToLokalise.mjs --langs tr      # just Turkish
 *   node scripts/exportStoryblokToLokalise.mjs --out ./tmp/lok
 *
 * ENV (.env.local auto-loaded): STORYBLOK_OAUTH_TOKEN, STORYBLOK_SPACE_ID, [STORYBLOK_MAPI_BASE]
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  REPO_ROOT,
  KEY_DELIM,
  ALL_LANGS,
  loadDotEnv,
  listAllStories,
  getStory,
  getComponentSchemaMap,
  isStoryExcluded,
  iterTranslatableFields,
  collectRichTextLeaves,
  isRichTextDoc,
  isTranslatableText,
  placeholdersIn,
  segmentKey,
  fieldKeyOf,
  ensureDir,
  writeJson,
} from './storyblokLokalise.lib.mjs';

function parseArgs(argv) {
  const args = {
    slugs: [],
    langs: ['tr', 'ar'],
    out: path.join(REPO_ROOT, 'storyblok-lokalise'),
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
    else if (a === '--langs')
      args.langs = next()
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
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

const sortObj = (o) =>
  Object.fromEntries(
    Object.keys(o)
      .sort()
      .map((k) => [k, o[k]]),
  );

async function main() {
  loadDotEnv();
  const args = parseArgs(process.argv.slice(2));
  ensureDir(args.out);

  console.log(`Export → ${path.relative(REPO_ROOT, args.out)}/   langs: ${args.langs.join(', ')}`);
  const schemaMap = await getComponentSchemaMap();

  const all = await listAllStories();
  const stubs = all
    .filter((s) => !s.is_folder && s.full_slug && !isStoryExcluded(s))
    .filter((s) => !args.slugs.length || args.slugs.includes(s.full_slug))
    .sort((a, b) => a.full_slug.localeCompare(b.full_slug));
  console.log(`In-scope stories: ${stubs.length}\n`);

  const en = {};
  const langFiles = Object.fromEntries(args.langs.map((l) => [l, {}]));
  const structured = {};
  const manifest = {
    generatedAt: new Date().toISOString(),
    spaceId: process.env.STORYBLOK_SPACE_ID,
    langs: args.langs,
    keyDelimiter: KEY_DELIM,
    keyFormat: `<full_slug>${KEY_DELIM}<ownerBlokUid>${KEY_DELIM}<field>[${KEY_DELIM}<leafIndex>]`,
    exportedFrom: 'management-api draft (== published unless unpublishedChanges is true)',
    stories: {},
    fields: {},
    segments: {},
    skippedNonTextFields: [],
  };
  const untranslated = Object.fromEntries(args.langs.map((l) => [l, {}]));
  let totalSegments = 0;

  for (const stub of stubs) {
    const slug = stub.full_slug;
    const story = await getStory(stub.id);
    const content = story.content;
    manifest.stories[slug] = {
      storyId: story.id,
      uuid: story.uuid,
      name: story.name,
      component: content.component,
      publishedAt: story.published_at,
      unpublishedChanges: !!story.unpublished_changes,
    };
    if (story.unpublished_changes)
      console.log(`  ⚠  ${slug}: unpublished changes — exporting DRAFT`);

    let storySegs = 0;

    const addSegment = ({ key, ownerUid, field, source, kind, leafIndex, ctx, curByLang }) => {
      en[key] = source;
      const state = {};
      for (const l of args.langs) {
        const cur = curByLang[l];
        const translated =
          cur !== undefined && cur !== '__DIVERGENT__' && cur !== '' && cur !== source;
        langFiles[l][key] = translated ? cur : '';
        state[l] =
          cur === undefined
            ? 'absent'
            : cur === '__DIVERGENT__'
              ? 'divergent'
              : cur === source
                ? 'same-as-source'
                : 'translated';
        if (!translated) (untranslated[l][slug] ||= []).push(key);
      }
      manifest.segments[key] = {
        slug,
        storyId: story.id,
        ownerUid,
        field,
        kind,
        leafIndex: leafIndex ?? null,
        source,
        context: ctx || '',
        placeholders: placeholdersIn(source),
        state,
      };
      structured[key] = {
        translation: source,
        notes:
          (ctx && ctx !== source ? `Full text: “${ctx}”  ·  ` : '') +
          `Storyblok ${content.component} · ${slug} · field "${field}"${
            kind === 'richtext' ? ' (rich text)' : ''
          }`,
        tags: ['storyblok', slug, content.component],
      };
      storySegs++;
    };

    // Discover translatable fields against ALL locales (maximal), emit only args.langs.
    for (const f of iterTranslatableFields(content, schemaMap, ALL_LANGS)) {
      const fieldKey = fieldKeyOf(slug, f.ownerUid, f.field);

      if (f.kind === 'non-text') {
        manifest.skippedNonTextFields.push({
          slug,
          ownerUid: f.ownerUid,
          field: f.field,
          note: 'oracled / asset / url field — not translator text',
        });
        continue;
      }

      if (f.kind === 'string') {
        const source = f.value;
        const key = segmentKey({ slug, ownerUid: f.ownerUid, field: f.field, leafIndex: null });
        manifest.fields[fieldKey] = {
          kind: 'string',
          storyId: story.id,
          ownerUid: f.ownerUid,
          uidPath: f.uidPath,
          field: f.field,
          source,
        };
        const curByLang = {};
        for (const l of args.langs) {
          curByLang[l] = typeof f.i18n[l] === 'string' ? f.i18n[l] : undefined;
        }
        addSegment({
          key,
          ownerUid: f.ownerUid,
          field: f.field,
          source,
          kind: 'string',
          leafIndex: null,
          ctx: '',
          curByLang,
        });
        continue;
      }

      // rich text
      const srcLeaves = collectRichTextLeaves(f.value, schemaMap);
      manifest.fields[fieldKey] = {
        kind: 'richtext',
        storyId: story.id,
        ownerUid: f.ownerUid,
        uidPath: f.uidPath,
        field: f.field,
        leafCount: srcLeaves.length,
        leaves: srcLeaves.map((l) => l.get()),
      };

      const aligned = {};
      for (const l of args.langs) {
        const tv = f.i18n[l];
        if (isRichTextDoc(tv)) {
          const tl = collectRichTextLeaves(tv, schemaMap);
          aligned[l] = tl.length === srcLeaves.length ? tl : 'divergent';
        } else aligned[l] = 'absent';
      }

      srcLeaves.forEach((leaf, leafIndex) => {
        const src = leaf.get();
        if (!isTranslatableText(src)) return; // keep the index, emit no key
        const key = segmentKey({ slug, ownerUid: f.ownerUid, field: f.field, leafIndex });
        const curByLang = {};
        for (const l of args.langs) {
          const a = aligned[l];
          curByLang[l] =
            a === 'absent' ? undefined : a === 'divergent' ? '__DIVERGENT__' : a[leafIndex].get();
        }
        const ctx = leaf.blockText && leaf.blockText !== src ? leaf.blockText : '';
        addSegment({
          key,
          ownerUid: f.ownerUid,
          field: f.field,
          source: src,
          kind: 'richtext',
          leafIndex,
          ctx,
          curByLang,
        });
      });
    }

    totalSegments += storySegs;
    console.log(`  ${slug.padEnd(46)} ${String(storySegs).padStart(4)} segments`);
  }

  writeJson(path.join(args.out, 'en.json'), sortObj(en));
  for (const l of args.langs) writeJson(path.join(args.out, `${l}.json`), sortObj(langFiles[l]));
  writeJson(path.join(args.out, 'keys-structured.json'), sortObj(structured));
  writeJson(path.join(args.out, 'manifest.json'), manifest);

  const md = [
    '# Storyblok → Lokalise export — still untranslated',
    '',
    `Generated ${manifest.generatedAt} · ${totalSegments} translatable segments across ${stubs.length} stories.`,
    '',
    'A segment is "untranslated" when the locale has no value for it, or its value still',
    'equals the English source. Some equal-to-source values are legitimate (brand names,',
    'lists like `1, 2, 3, 4`), so treat this as a review list, not a defect list.',
    '',
  ];
  for (const l of args.langs) {
    const perStory = untranslated[l];
    const totalMissing = Object.values(perStory).reduce((n, a) => n + a.length, 0);
    md.push(`## ${l.toUpperCase()} — ${totalMissing} / ${totalSegments} segments need work`, '');
    for (const slug of Object.keys(perStory).sort())
      md.push(`- \`${slug}\` — ${perStory[slug].length}`);
    md.push('');
  }
  fs.writeFileSync(path.join(args.out, 'UNTRANSLATED.md'), md.join('\n') + '\n');

  fs.writeFileSync(
    path.join(args.out, 'README.md'),
    [
      '# storyblok-lokalise/',
      '',
      'Generated by `scripts/exportStoryblokToLokalise.mjs`.',
      'Full workflow: `docs/storyblok-lokalise-roundtrip.md`.',
      '',
      '| file | purpose |',
      '| --- | --- |',
      '| `en.json` | Lokalise **base language** upload (plain JSON) |',
      '| `keys-structured.json` | optional richer base upload — sentence context as *notes*, per-page *tag* (Lokalise format **Structured JSON**) |',
      '| `tr.json`, `ar.json` | existing translations, same keys (plain JSON). `""` = not translated yet |',
      '| `manifest.json` | **the contract** — key → exact Storyblok location + English snapshot. Keep it unchanged; the importer needs it. Commit it. |',
      '| `UNTRANSLATED.md` | gaps per language / per story |',
      '',
      '```bash',
      '# after editing in Lokalise, download tr.json / ar.json into ./storyblok-lokalise/incoming/',
      'node scripts/importStoryblokFromLokalise.mjs --in ./storyblok-lokalise/incoming            # dry-run',
      'node scripts/importStoryblokFromLokalise.mjs --in ./storyblok-lokalise/incoming --write --yes',
      'node scripts/importStoryblokFromLokalise.mjs --in ./storyblok-lokalise/incoming --write --yes --publish',
      '```',
      '',
    ].join('\n') + '\n',
  );

  console.log(
    `\n✓ ${totalSegments} segments · ${Object.keys(manifest.fields).length} fields · ${stubs.length} stories` +
      ` → ${path.relative(REPO_ROOT, args.out)}/`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
