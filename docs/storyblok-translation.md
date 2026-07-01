# Translating / completing Storyblok content in any locale

`scripts/translateStoryblok.mjs` fetches English Storyblok stories, **completes their
missing field-level translations** in any locale(s), and writes the result back as
**drafts**. It follows the field-level (`field__i18n__<lang>`) model Storyblok uses.

Default behaviour is **gap-fill**: a run never clobbers existing translations — it only
adds what's missing (new fields, and the still-English leaves inside partly-translated
rich-text). Default target locales are **all non-English locales**. So the everyday
command to top up every page in every language is:

```bash
yarn translate:storyblok --all --include-policies            # dry-run, all langs, gap-fill
yarn translate:storyblok --slug grounding --langs de --engine file   # one page, one lang
```

## Hard-won learnings baked into the script

- **Discovery = schema, not just the oracle.** A field is translatable if the component
  **schema** marks it `translatable: true` (authoritative) OR it already has a
  `field__i18n__<refLang>` sibling. Schema discovery catches sections never translated in
  _any_ language (e.g. a newly added "Our volunteers" block) that an oracle-only approach
  misses.
- **Embedded rich-text content renders from the PARENT field's `__i18n__` copy** — not
  from sibling keys on the embedded bloks. So accordions/FAQs/row-columns/exercises inside
  a rich-text field must be translated **inline** within that field's copy. (Confirmed
  against the existing German translations.) The script does this and strips stray
  `__i18n__` keys that were wrongly written inside rich-text docs.
- **Gap-fill preserves professional translations.** Inside an existing rich-text copy, only
  leaves still identical to the English default are translated; everything already
  translated is left exactly as-is.
- **Divergent fields are reported, not guessed.** If the default rich-text changed after it
  was translated (leaf counts no longer line up), the script skips that field and lists it
  so you can `--overwrite` or fix it by hand, rather than mis-pairing translations.

> **Why here and not bloom-backend?** The stories it translates (home, welcome, policies,
> meet-the-team, messaging, therapy/book-session, whatsapp, and grounding/activities
> exercises) are frontend-only content. bloom-backend only stores Storyblok _uuids_ for
> courses/resources — the very content we exclude. Storyblok rendering already lives in
> this repo alongside the i18n message files and the established `scripts/` tooling.

## What it does / doesn't touch

- **Translates:** every field the component schema marks `translatable: true`, plus any
  field already translated in a reference language. Rich-text is translated fully inline
  (text nodes + embedded component fields).
- **In scope (`--all`):** `home`, `welcome/*`, `meet-the-team`, `messaging`,
  `therapy/book-session`, `subscription/whatsapp`, `grounding/*` + `activities/*`
  exercises, and generic single pages.
- **Refused:** `courses/*`, `videos/*`, `shorts/*`, `conversations/*`, and any `course`
  / `session` component — their video/audio isn't available in these locales.
- **`policies/*`:** excluded from `--all` by default (legal text → prefer professional
  translation). Opt in with `--include-policies`, and review carefully.
- **Never touched:** assets/images, URLs, link `href`s, option values, `_uid`,
  `component`. Rich-text is translated node-by-node so structure/marks are preserved.

## Safety model

1. **Dry-run by default** — nothing is written without `--write` (which also needs `--yes`).
2. **Drafts only** — every write is `publish: 0`. The script **never publishes**; a human
   publishes from the Storyblok editor after review.
3. **GET → modify → PUT** — the live story is fetched first; we only _add_ the new locale
   keys, so default content and existing translations are preserved.
4. **Non-clobbering** — existing target-locale values are left alone unless `--overwrite`.
5. **Snapshots** — each story's original JSON is saved to `.storyblok-translation/` before
   any write; Storyblok's per-story version history is a second rollback path.

## Prerequisites

1. Create the **`ar` and `tr` language dimensions** in Storyblok → Settings → Languages.
   (Until they exist, `__i18n__ar`/`__i18n__tr` keys are ignored.)
2. Env (add to `.env.local`, which the script auto-loads):
   ```
   STORYBLOK_OAUTH_TOKEN=...   # Management API token with WRITE scope (NOT the public read token)
   STORYBLOK_SPACE_ID=...      # numeric space id
   ANTHROPIC_API_KEY=...       # required for --engine api (the default)
   # STORYBLOK_MAPI_BASE=https://mapi.storyblok.com/v1   # EU default; matches our delivery host
   # ANTHROPIC_MODEL=claude-opus-4-8
   ```

## Recommended procedure (cautious, one page first)

```bash
# 1. PILOT — dry-run on a single non-critical page. Writes proposed JSON to disk only.
yarn translate:storyblok --slug meet-the-team

# 2. Inspect the proposal and the original snapshot:
#    .storyblok-translation/meet-the-team.proposed.json
#    .storyblok-translation/meet-the-team.original.json

# 3. Write it as a DRAFT (still unpublished):
yarn translate:storyblok --slug meet-the-team --write --yes

# 4. Review the draft in the Storyblok editor; do an Arabic RTL visual pass on staging.
#    Publish manually when satisfied.

# 5. Scale up once you trust the output (still dry-run until you add --write --yes):
yarn translate:storyblok --all
```

### Human-in-the-loop translation (no API key)

Use `--engine file` to export source strings instead of calling Claude:

```bash
yarn translate:storyblok --slug meet-the-team --engine file
# → writes .storyblok-translation/meet-the-team.ar.todo.json (a JSON array of strings)
# Translate that array (e.g. paste to a translator), save the SAME-LENGTH array as
# meet-the-team.ar.done.json, then re-run to apply + (optionally) --write.
```

## Notes & limitations

- **Legal pages** (`policies/*`) and anything compliance-sensitive should go through
  professional/legal translation, not the LLM path.
- A grounding exercise that embeds an English **audio** clip will have its page _text_
  translated; the audio gracefully falls back to the default language.
- Machine translation still needs human QA — especially for the trauma-informed register.
  The register prompts mirror the in-app rules: gender-neutral MSA for Arabic, warm
  informal "sen" for Turkish, brand/legal names kept in Latin, placeholders preserved.
- Management API is rate-limited; the script throttles and retries on HTTP 429.
- Course/resource **titles** will still appear in English on translated pages (those
  stories are intentionally excluded) — expected given the media constraint.
