# Storyblok ⇄ Lokalise translation round-trip

Export every translatable string from the **frontend Storyblok stories** into Lokalise-ready
JSON, QA / edit the translations in Lokalise, then write the changes back to Storyblok
precisely — without ever touching the English source or a language you didn't edit.

|                         |                                                                                                                                                       |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Export                  | `yarn export:storyblok-lokalise` → `scripts/exportStoryblokToLokalise.mjs` (read-only)                                                                |
| Import                  | `yarn import:storyblok-lokalise` → `scripts/importStoryblokFromLokalise.mjs` (drafts; `--publish` to publish)                                         |
| Shared logic            | `scripts/storyblokLokalise.lib.mjs` — scope, field discovery, rich-text leaf order, key format. The two scripts **must** agree, so it all lives here. |
| Baseline output         | `storyblok-lokalise/` (committed)                                                                                                                     |
| Your Lokalise downloads | `storyblok-lokalise/incoming/` (git-ignored)                                                                                                          |

This is the sibling of `scripts/translateStoryblok.mjs` (machine-translates _missing_ fields)
and `scripts/fixStoryblokTranslations.mjs` (applies a hand-written find/replace list). Use
**this** flow when the edit happens in Lokalise.

---

## 1. Scope

**In scope — 33 stories** (whatever `translateStoryblok.mjs` also translates):

- `grounding/overview` + all `grounding/*` exercises (`resource_grounding`)
- all `activity/*` exercises (`resource_activity`)
- `home`, `welcome/bumble`, `welcome/badoo`, `meet-the-team`
- `messaging`, `subscription/whatsapp`, `therapy/book-session`, `policies/terms-of-service`

**Excluded** (media not localised for these locales — same rule as `translateStoryblok.mjs`):
`courses/*`, `video/*`, `audio/*`, `written/*`, and any `Course` / `Session` / `session_iba` /
`resource_video` / `resource_audio` / `resource_written` component.

The exclusion is enforced in `storyblokLokalise.lib.mjs` (`EXCLUDED_PREFIXES`,
`EXCLUDED_COMPONENTS`). App UI strings (`i18n/messages/**`) are **not** part of this — they
already have their own `check:translations` flow.

**Languages:** the export defaults to `tr, ar` (`--langs de,fr,…` to change). English is
always emitted as the source. The tooling is fully language-agnostic — see
§11 for reusing it on `de/fr/es/pt/hi` or a brand-new locale. `de/fr/es/pt/hi` were left
out of the committed baseline on purpose: they are only 50–85 % translated for this content
and carry a lot of pre-existing structural drift (§11).

---

## 2. What a "segment" is, and the key format

Storyblok stores a field translation in a sibling key: `title` → `title__i18n__tr`. A
**rich-text** field is a `doc` tree; its translation is a full clone of that tree with the
text swapped inline. Content embedded in rich text (accordions, quotes, link cards…) renders
from that parent copy — so every embedded translatable string is just another _leaf_ of the
parent field.

The export walks each story and emits one **segment** per translatable leaf:

```
KEY = <full_slug>|<ownerBlokUid>|<field>[|<leafIndex>]
```

The delimiter is `|`, **not** `::` — Lokalise treats `::` in a key name as a nesting
separator (web UI, Structured JSON, and the round-trip download), which would shred these
composite keys. `|` has no special meaning in Lokalise key names, and Storyblok
slugs / `_uid`s / field names never contain it.

| part           | meaning                                                                                                                                                                                                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `full_slug`    | e.g. `grounding/grounding-box-breathing`, `home`, `meet-the-team`                                                                                                                                                                                                                 |
| `ownerBlokUid` | `_uid` of the blok that owns the field. **Anchored on `_uid`, not position**, so reordering team members / sections doesn't break the mapping.                                                                                                                                    |
| `field`        | the schema field name — `title`, `description`, `body`, `bio`, `role`, `content`, …                                                                                                                                                                                               |
| `leafIndex`    | for a rich-text field, the 0-based index of the text node in a deterministic depth-first walk (identical to `translateStoryblok.mjs`). **Absent** for a plain string field. Indices can have gaps — non-translatable text nodes like `1, 2, 3, 4` keep their slot but get no key. |

Example:

```
grounding/grounding-box-breathing|92616aec-…|name             → "Box breathing"
grounding/grounding-box-breathing|92616aec-…|description|0     → "A steady four-count breath…"
grounding/grounding-box-breathing|92616aec-…|body|0           → "Before you get started…"
therapy/book-session|e876e86a-…|content|13                    → "…{partnerName}…"
```

### Segmentation is per text node

Chosen to match `translateStoryblok.mjs` exactly (lowest round-trip risk). A sentence split
by a link becomes 2–3 keys. The **full sentence is attached as a note** (see
`keys-structured.json` and `manifest.json → segments[key].context`) so a translator can still
translate the fragment so it fits. This is the main quality trade-off — see §8.

---

## 3. Output files (`storyblok-lokalise/`)

| file                   | what it is                                                                                                                                                                                          | commit it?         |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `en.json`              | flat `{ key: "<English source>" }` — the **Lokalise base-language upload**                                                                                                                          | yes (baseline)     |
| `tr.json`, `ar.json`   | flat `{ key: "<current Storyblok translation>" }`. `""` = not translated yet (or still equals English)                                                                                              | yes (baseline)     |
| `keys-structured.json` | Lokalise **Structured JSON**: `{ key: { translation, notes, tags } }`. `notes` carries the full-sentence context; `tags` are `["storyblok", "<slug>", "<component>"]`. Optional richer base upload. | yes                |
| `manifest.json`        | **the contract.** Every key → exact Storyblok location, plus a snapshot of the English source at export time. The importer needs this file **unchanged**.                                           | **yes — required** |
| `UNTRANSLATED.md`      | per-language / per-story count of segments still needing work                                                                                                                                       | yes                |
| `README.md`            | one-screen crib                                                                                                                                                                                     | yes                |

`manifest.json` also lists `skippedNonTextFields` (asset / URL fields — not translator work)
and, per story, `unpublishedChanges` (whether the export read a dirty draft — see §7).

---

## 4. Lokalise setup

You only need to do this once; afterwards it's upload → work → download.

### 4a. Create the project / upload keys

1. New Lokalise project (or an existing one). Base language **English**; add **Turkish** and
   **Arabic**.
2. **Upload → `en.json`**, format **JSON (flat)**. Settings:
   - **"Detect ICU plurals"** — leave **off**. Our keys contain none; `therapy/book-session`
     uses `{partnerName}` which is a plain placeholder, not a plural.
   - **"Replace line breaks with `\n`"** — off.
   - **No nested-key / key-separator option.** The file is flat and the keys use `|`, which
     Lokalise leaves alone. (Never set the separator to `|` or `/` — that would split them.)
   - Assign to language **English**.
   - Optionally tick **"Front / Tag keys"** with a tag like `storyblok-export`.
   - _Alternative:_ upload `keys-structured.json` as format **Structured JSON** instead — same
     keys (they contain no `::` so they stay flat), but you also get the sentence context as
     **notes** and a per-page **tag** (`grounding/grounding-box-breathing`, `resource_activity`,
     …) so translators can filter
     to one page at a time. Recommended.
3. **Upload → `tr.json`** as language **Turkish**, then **`ar.json`** as **Arabic**, format
   **JSON**, **same key names**. Turn **on** "Fill existing translations" and (your call)
   "Mark uploaded translations as **Reviewed / not reviewed**". Empty `""` values import as
   untranslated, which is what you want.

`UNTRANSLATED.md` tells you which keys came in empty.

### 4b. Do the work

Translate / QA in Lokalise as normal. For a fragment key, read the **note** for the full
sentence. The `{partnerName}` placeholder in `therapy/book-session` must survive verbatim —
Lokalise placeholder QA will flag it if it's dropped; the importer will **also** reject any
value whose placeholders don't match (see §6).

### 4c. Download for import

**Download / Export → JSON**, one file per language:

- Format **JSON, flat** (plain `key: value`). _(Structured JSON also works — the importer
  reads the `translation` field.)_
- **"Include all platform keys"** on; **"Empty translations: skip / leave empty"** — either is
  fine, the importer skips blanks.
- **Do not** enable "nest keys" / set a key separator — the keys must come back flat and
  identical (`grounding/grounding-box-breathing|<uid>|body|0`). The importer aborts if **zero**
  incoming keys match the manifest (the classic symptom of a nested export) and prints a
  sample of each side to compare.
- **Do not** rename keys in Lokalise. A renamed key can't be mapped back and is reported as
  `key not in manifest`.

Save the files as `storyblok-lokalise/incoming/tr.json` and `…/ar.json`.

---

## 5. Import back into Storyblok

```bash
# 1. Dry-run — shows exactly what would change, writes nothing
yarn import:storyblok-lokalise --in ./storyblok-lokalise/incoming

# 2. Apply as DRAFTS (nothing goes live yet)
yarn import:storyblok-lokalise --in ./storyblok-lokalise/incoming --write --yes

# 3. Review drafts in the Storyblok editor (RTL visual pass for Arabic), then either publish
#    each story by hand, or re-run with --publish to publish exactly the stories that changed:
yarn import:storyblok-lokalise --in ./storyblok-lokalise/incoming --write --yes --publish
```

Useful flags:

| flag                    | effect                                                                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--manifest <path>`     | default `./storyblok-lokalise/manifest.json`                                                                                                                 |
| `--in <dir>`            | folder holding `tr.json` / `ar.json` (names must be the locale codes)                                                                                        |
| `--file tr=<path>`      | point at one file explicitly (repeatable)                                                                                                                    |
| `--langs tr`            | restrict to some of the languages present                                                                                                                    |
| `--slug home,messaging` | restrict to some stories                                                                                                                                     |
| `--write --yes`         | actually PUT (drafts). `--yes` guards against an accidental `--write`.                                                                                       |
| `--publish`             | after writing, publish the stories that changed (only those)                                                                                                 |
| `--overwrite-divergent` | re-clone a rich-text field from English when its existing translation's structure has drifted — normal for `de/fr/es/pt/hi` (§11), a last resort for `tr/ar` |

Every story it writes is snapshotted to `.storyblok-translation/<slug>.beforeimport.json`
first, and Storyblok keeps per-story version history, so rollback is always possible.

### Reading the summary

```
written: 14   no-op: 640   blank: 30   unknown key: 0   skipped: 3
```

- **written** — leaves updated.
- **no-op** — incoming value already equals what's in Storyblok. Expected to be large.
- **blank** — incoming value was empty; skipped.
- **unknown key** — key not in the manifest (stale export, or renamed in Lokalise). Listed.
- **skipped** — needs a human. Grouped by reason:

| reason                           | meaning                                                                                                                                                      | what to do                                                                                                                                                                                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source-changed`                 | the English for this field changed in Storyblok since the export                                                                                             | re-run the export, re-upload to Lokalise (Lokalise keeps your translations for unchanged keys), re-download, re-import                                                                                                                                                  |
| `owner-blok-missing`             | the blok (`_uid`) was deleted & recreated                                                                                                                    | that content is effectively new — translate it fresh (`translateStoryblok.mjs` or a new export)                                                                                                                                                                         |
| `placeholder-mismatch`           | the translation dropped/added a `{placeholder}`                                                                                                              | fix the translation in Lokalise, re-download                                                                                                                                                                                                                            |
| `existing-translation-divergent` | Storyblok already has a translation for this rich-text field whose leaf structure no longer matches the English (English was edited after it was translated) | `--overwrite-divergent` re-clones the field from English and applies the incoming values. For `de/fr/es/pt/hi` this is expected and correct (§11). For `tr/ar` it's rare — check the field by hand first, since the existing translation for it is otherwise discarded. |
| `field-not-in-manifest`          | key parsed but its field group isn't in the manifest                                                                                                         | stale manifest — re-export                                                                                                                                                                                                                                              |

---

## 6. Safety guarantees

1. **Dry-run by default.** No write without `--write --yes`.
2. **Drafts only** unless you pass `--publish`, and `--publish` only touches stories the run
   actually changed.
3. **Language-scoped writes.** The importer only ever assigns `<field>__i18n__<lang>`. The
   English base fields and every other locale are byte-identical afterwards. (Verified: a
   Turkish import leaves `body`, `body__i18n__ar`, `body__i18n__de`, … untouched.)
4. **Source-drift guard.** Before writing a field, the live English is compared to the
   manifest snapshot (whole value for strings; every leaf for rich text). Any difference →
   the **whole field** is skipped and reported, never mis-applied.
5. **Placeholder guard.** An incoming value is rejected if its `{…}` tokens don't match the
   source's.
6. **No-op / blank skip.** Unchanged and empty values are never written.

---

## 7. Draft vs published

- The **export reads the Storyblok draft** (Management API). Almost always the draft equals
  the published version; when it doesn't, the story is flagged `⚠ unpublished changes` in the
  export log and `unpublishedChanges: true` in `manifest.json`.
- The CDN delivers translations **merged** (`?language=tr` swaps the base fields and drops the
  raw `__i18n__` keys). So "no `__i18n__` keys in the published CDN response" does **not**
  mean the translation isn't published — it is, just pre-merged.
- The **importer writes the draft** and, with `--publish`, publishes it. If a story is already
  flagged `⚠ has unpublished changes`, `--publish` will also push whatever else was pending in
  that draft — the importer warns; publish that story from the editor instead if unsure.

At export time only `policies/terms-of-service` had unpublished changes.

---

## 8. Gaps & caveats — read before trusting a round-trip

1. **Fragment segmentation.** A sentence broken by a link/bold mark is 2–3 keys. Context is
   in the note, but a translator who ignores the note can still produce a fragment that reads
   oddly in Arabic (word order crosses the link boundary). If this bites, the fix is a v2 of
   the exporter that emits one segment per block with inline `{0}…{/0}` tags — more moving
   parts on re-import. Not built.
2. **Image `alt` text is not exportable.** `alt` / `title` live on the shared _asset_ object,
   not on a translatable blok field — there is no `alt__i18n__<lang>`. Every locale shows the
   English alt today, professional locales included. Localising it needs a Storyblok **schema**
   change. Separate accessibility ticket. (`manifest.json → skippedNonTextFields` lists the
   asset fields that were seen and skipped.)
3. **`de/fr/es/pt/hi` are not in this export.** Re-run with `--langs de,fr,es,pt,hi` if you
   want them — but note they are substantially incomplete for grounding/activity content, so
   most of those files would be `""` and Lokalise would treat them as a big translation job,
   not a QA pass.
4. **`meet-the-team` is 147 segments** — team member `role` / `languages` / `website_title`
   strings + `bio` / `short_bio` rich text, one set per person. Reordering people is safe
   (keys are `_uid`-anchored); adding a person means new keys on the next export.
5. **Course/session cross-references inside translated activities** (e.g. the Turkish activity
   text says _"Cinsel travma nedir?"_) point at pages that are **English-only** by design.
   Those inline strings are still exported and translatable; the linked page just won't match.
   This is the known course/session coverage gap, not a bug in this flow.
6. **`therapy.cancelAlert`-style developer strings** — none are in Storyblok scope, but if one
   appears, it will be exported like any other string. Review the export.
7. **Re-running the export overwrites `storyblok-lokalise/*.json` and `manifest.json`.** Commit
   or stash first if you want to keep a prior baseline. The importer always uses whatever
   `manifest.json` you point it at.
8. **Rate limits.** Both scripts throttle and retry on HTTP 429; a full export/import of all
   33 stories takes a minute or two.

---

## 9. Recommended: run the import from a fresh session

The export in this repo was produced in the same session as a large translation review. The
**import step happens later, against real Lokalise output, and is where careful verification
matters most** — it writes to Storyblok. Start it in a new AI/agent window (or just run it
yourself) with this doc as the entry point:

1. `git pull`, confirm `storyblok-lokalise/manifest.json` is the one that matches your Lokalise
   project (check `generatedAt`).
2. Put the Lokalise downloads in `storyblok-lokalise/incoming/`.
3. `yarn import:storyblok-lokalise --in ./storyblok-lokalise/incoming` (dry-run) and read the
   summary in full.
4. If `source-changed` appears for more than a couple of fields, re-export first (§5 table).
5. `--write --yes`, review drafts in Storyblok, then `--publish` (or publish by hand).

---

## 10. ENV

`.env.local` is auto-loaded. Needs a **Management API** token (not the public delivery token):

```
STORYBLOK_OAUTH_TOKEN=...     # Personal access token / OAuth with write scope for the space
STORYBLOK_SPACE_ID=...        # numeric
# STORYBLOK_MAPI_BASE=https://mapi.storyblok.com/v1   # EU default; set for US spaces
```

---

## 11. Reusing this for other languages

The scripts don't care which languages — `--langs de,fr,es,pt,hi` (or any single code) on
the export, and the import writes whatever files you hand it. But the _experience_ differs by
how much of that language already exists in Storyblok:

| situation                              | what the export looks like                                                                                                                                                                               | import path                                                                                                                                                                                                                                           |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`tr` / `ar`** (this baseline)        | ~99 % filled, 0 structural drift — a clean QA pass                                                                                                                                                       | plain `--write`                                                                                                                                                                                                                                       |
| **`de` / `fr` / `es` / `pt` / `hi`**   | 50–85 % filled, **and 15–40 % of segments show blank because their old translation was made against an earlier English and the leaf structure has since drifted** (`state: "divergent"` in the manifest) | translators fill the blanks; on import those fields report `existing-translation-divergent` — re-run with **`--overwrite-divergent`**, which is the _right_ move here (the old text is stale; you're replacing it with the complete Lokalise version) |
| **a brand-new locale** (e.g. add `it`) | 100 % blank = a full translation job                                                                                                                                                                     | imports cleanly — nothing to diverge from                                                                                                                                                                                                             |

Steps for a new language, e.g. German:

```bash
git checkout -b storyblok-lokalise-de              # keep the tr/ar baseline untouched
yarn export:storyblok-lokalise --langs de          # overwrites storyblok-lokalise/*
# upload storyblok-lokalise/en.json + de.json to Lokalise, translate, download to incoming/de.json
yarn import:storyblok-lokalise --in ./storyblok-lokalise/incoming --langs de           # dry-run
yarn import:storyblok-lokalise --in ./storyblok-lokalise/incoming --langs de --overwrite-divergent --write --yes
```

Re-exporting **overwrites `storyblok-lokalise/`** — branch first (or `--out ./tmp/lok-de`) if
you want to keep the current tr/ar baseline in place.

One export ↔ one Lokalise upload ↔ one import against _that_ `manifest.json`. As long as the
English hasn't changed in Storyblok, keys are stable across re-exports and an older Lokalise
project still lines up — but the source-drift guard (§6) is what actually protects you, so
trust the dry-run summary over that assumption.
