# Library theme rename: harm → abuse

> Rename two library themes — slug and copy — across `bloom-frontend`, `bloom-backend`, and
> Storyblok. The library feature that surfaces themes is not released yet, so this is a
> straight rename with no compatibility shims; only the deploy order matters.
>
> | Old slug           | New slug            | Old label          | New label           |
> | ------------------ | ------------------- | ------------------ | ------------------- |
> | `recognising-harm` | `recognising-abuse` | "Recognising harm" | "Recognising abuse" |
> | `why-harm-happens` | `why-abuse-happens` | "Why harm happens" | "Why abuse happens" |
>
> Plus the Home / Welcome "Individual sessions" intro: _"…understanding **harm**…"_ →
> _"…understanding **abuse**…"_.

## Where the slug lives

| System               | Location                                                                           |
| -------------------- | ---------------------------------------------------------------------------------- |
| Frontend types       | `ThemeKey` union + `THEME_KEYS` — `lib/utils/libraryData.ts`                       |
| Frontend i18n        | key names + `label` / `blurb` / `description` under `Library.themes.*` (8 locales) |
| Frontend runtime     | `?theme=` URL param, analytics `library_themes` property                           |
| Backend enum         | `THEMES` — `bloom-backend/src/utils/constants.ts`                                  |
| Backend DB           | `session_themes_enum`, `course_themes_enum`, `resource_themes_enum` Postgres types |
| Storyblok datasource | `themes` (id `195869276618527`) — entry `value` + `name`                           |
| Storyblok content    | `content.themes` array on **37** published stories (Course / Session / resource)   |

Storyblok story _body copy_ uses the word "harm" in ~70 stories as ordinary editorial
language — **out of scope**, untouched. Only the `themes` field values change.

## Status

- **Storyblok datasource — done.** The two `themes` entries are renamed (`value` + `name`).
- **Storyblok stories — done in DRAFT.** `scripts/storyblok/05-rename-themes.mjs --write --yes
--draft-only` rewrote `content.themes` on all 37 tagged stories. **Published versions still
  carry `recognising-harm` / `why-harm-happens`** — no webhook fired, prod + staging backend
  untouched. The 36 previously-clean stories now show "unpublished changes" in Storyblok.
- **bloom-backend — code ready, not deployed.** `constants.ts` + migration
  `1788885368027-bloom-backend.ts`.
- **bloom-frontend — code ready, not merged.** Slug + i18n rename.

## Release order (when the library feature ships)

Publishing a Storyblok story fires the content webhook at bloom-backend, which writes
`content.themes` into a Postgres enum-array column. A backend still on the old enum rejects
`recognising-abuse` and fails the whole story sync. So:

1. **bloom-backend** — deploy `constants.ts` + migration `1788885368027-bloom-backend.ts`
   (`ALTER TYPE … RENAME VALUE` ×2 on each of the 3 enums; renames the label in place, no row
   backfill). Run the migration on **every environment the Storyblok webhook hits** (staging
   **and** production — `bloom-backend-staging.onrender.com` + `bloom-api.chayn.co`).
2. **bloom-frontend** — merge the slug + i18n rename.
3. **Storyblok** — `node scripts/storyblok/05-rename-themes.mjs --write --yes` (no
   `--draft-only`) to republish the 37 stories, now that both webhook targets accept the new
   value. `--publish-pending` also republishes any story that has unrelated pending edits —
   check the manifest first.

Verify after step 3:
`GET /v2/cdn/stories?version=published&filter_query[themes][any_in_array]=recognising-harm` → 0
(same for `why-harm-happens`).

## Notes

- **Analytics discontinuity.** `library_themes` event values change (`recognising-harm` →
  `recognising-abuse`). No bridge; flag to whoever owns the GA4 / Looker dashboards.
- **Datasource entry `name`** ("Recognising harm" → "Recognising abuse") is editor-facing only
  — the frontend renders its own i18n `label`.
- `themes` is **not** a translatable Storyblok field: one update per story.
- `ALTER TYPE … RENAME VALUE` is transaction-safe on Postgres 10+ (prod is 17).
- Out of scope, deliberately: `courses/en.json` "imminent threat or harm", the `messaging`
  welcome "immediate risk of harm", and `Library.themes.staying-safe`'s "still in or near harm"
  (broader than "abuse" by design).

### Needs a human

Translator review of the 7 non-English locales for `Library.themes.recognising-abuse` /
`why-abuse-happens` (`label` / `blurb` / `description`) and
`Shared.librarySections.sessions.introduction`. English wording is final; the others were
changed to each language's existing "abuse" term (de _Missbrauch_, fr _les abus_, es/pt
_abuso_, hi _abuse_, ar _الإساءة_, tr _istismar_) but not professionally reviewed.
