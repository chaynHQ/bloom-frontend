# Resource Type Rename Plan — shorts / conversations / somatics → video / audio / written

> Goal: replace the three ad-hoc resource types (**shorts**, **conversations**, **somatics**)
> with three format-based types — **video**, **audio**, **written** — across the whole system:
> internal enums, Storyblok component + folder structure, URL routes, and Google Analytics
> event names. **`written` is a new type and must be built as part of this work.**
>
> This is a single source-of-truth task list intended to be executed largely by AI agents —
> every phase is scoped, ordered, and lists the concrete files involved. It spans **two repos**:
> `bloom-frontend` (this repo) and `bloom-backend` (`../bloom-backend`), plus **Storyblok CMS**
> and **Google Analytics 4** configuration that must be changed by a human.

---

## Important framing

This is a **coordinated cross-system migration, not a refactor**. The code changes are routine
and well-typed. Almost all the risk lives in three places:

1. **Storyblok content migration** — renaming/merging 3 component types, moving 3 content
   folders, and rewriting every resource story's `component` value, while the publish webhook
   is live and editors may be mid-edit. Needs a Management API script.
2. **URL / SEO continuity** — `/shorts/*`, `/conversations/*`, `/videos/*` are indexed and in
   `public/sitemap.xml`. Folder moves change every `full_slug`. Needs exhaustive per-locale
   301 redirects + a sitemap regen.
3. **Analytics history discontinuity** — GA4 **cannot** retro-rename events. Renaming them
   permanently splits every resource metric series and breaks saved explorations, Looker
   Studio dashboards, audiences, and the `bloom-backend` Slack reporting service until each is
   updated.

Deploy order is load-bearing (Phase 2 → 3 → 4). Getting it wrong means resource progress
silently stops recording for migrated stories, or resource pages 404.

### What is NOT affected (do not touch)

- `resource-user` / `resource-feedback` flows in either repo — they key on `storyblokUuid` /
  `resourceId` only, never on type/category.
- `bloom-backend` `event-logger` (`EVENT_NAME` enum) — records no resource events.
- Postgres schema — `resource.category` is a plain `character varying` column, **not** an enum
  type. No `ALTER TYPE` needed; a data backfill is enough.
- Partner access, feature flags, Mailchimp, Front, Simplybook — no coupling to resource type.

---

## Decisions locked for this plan

These were confirmed with the product owner. If any change, revisit the affected phases.

| # | Decision | Value used in this plan |
|---|---|---|
| 1 | Scope | **Full rename**: enums + Storyblok components + URL routes + GA event names. |
| 2 | `written` type | **Build it now** — new Storyblok component, route, rendering, library mapping. |
| 3 | Route shape | **Three format routes**: `/[locale]/video/[slug]`, `/[locale]/audio/[slug]`, `/[locale]/written/[slug]`. |
| 4 | Component merge | **Merge** `resource_short_video` + `resource_single_video` → one `resource_video`. `resource_conversation` → `resource_audio`. New `resource_written`. |
| 5 | Canonical type string | `video` / `audio` / `written` — identical in both repos, in the DB `resource.category` column, and as the GA `resource_category` param. |
| 6 | GA event prefixes | `RESOURCE_VIDEO_*` / `RESOURCE_AUDIO_*` / `RESOURCE_WRITTEN_*`. |
| 7 | `somatics` tag | Drop from code (remove the `with_tag` filter). Tag may stay in Storyblok for editorial use with no code meaning. |
| 8 | Old URL redirects | Permanent (301). |

### Decisions the implementing agent MUST get answered before starting

These are genuine product/infra choices that change the work. Ask a human; do not guess.

- **A. Access gating for the merged `video` route.** Today **shorts are public**
  (`/shorts` is not in `AuthGuard`'s authenticated paths; the page renders a preview + login
  overlay) but **single videos are account-gated** (`/videos` IS gated). Merging routes forces
  one rule. Options: (a) all `video` public with login overlay like shorts do now; (b) all
  `video` gated; (c) keep per-story gating via `included_for_partners` + a new "requires
  account" boolean field on the component. **Pick one — Phase 3 depends on it.**
- **B. Does `written` support "mark as complete"?** If yes → it wires into `resource-user`
  progress + shows `ResourceFeedbackForm` + needs `RESOURCE_WRITTEN_STARTED/_COMPLETE_*`
  events. If no → it is a read-only page, simpler.
- **C. Does `written` require an account?** (→ `AuthGuard` + `pathRequiresAccount`.)
- **D. `written` field schema** — proposed in Phase 2.1; confirm with content team.
- **E. Should previously-hidden `videos/` stories (untagged, i.e. non-somatic) now appear in
  the library?** Dropping the `with_tag: somatics` filter surfaces them. If not desired they
  need a curation flag / `coming_soon`.
- **F. Who owns the GA4 / Looker Studio dashboard updates?** (Not in either repo.)
- **G. The real Storyblok component name for shorts** — see landmine L1.

---

## Current-state inventory

### The three types today

| Product name | Storyblok `component` | Folder / route | Library `Format` | DB `resource.category` | GA event family (`eventPrefix`) |
|---|---|---|---|---|---|
| Shorts | `resource_short_video` | `shorts/` → `/[locale]/shorts/[slug]` | `video` | `short_video` | `RESOURCE_SHORT_VIDEO_*` (`eventPrefix="RESOURCE_SHORT"`) |
| Conversations | `resource_conversation` | `conversations/` → `/[locale]/conversations/[slug]` | `audio` | `conversation` | `RESOURCE_CONVERSATION_*` (`eventPrefix="RESOURCE_CONVERSATION"` → emits `RESOURCE_CONVERSATION_AUDIO_*`) |
| Somatics | `resource_single_video` **+ Storyblok tag `somatics`** | `videos/` → `/[locale]/videos/[slug]` | `video` | `single_video` | `RESOURCE_SINGLE_VIDEO_*` (`eventPrefix="RESOURCE_SINGLE_VIDEO"` → emits `RESOURCE_SINGLE_VIDEO_VIDEO_*`) |
| _(new)_ Written | — | — | `written` (already in the `Format` union + `Library.contentTypes` i18n; no component mapped) | — | — |

### Target mapping

| Old component | Old route | Old category | Old event prefix | → New component | New route | New category | New event prefix |
|---|---|---|---|---|---|---|---|
| `resource_short_video` | `/shorts/[slug]` | `short_video` | `RESOURCE_SHORT_VIDEO_*` | `resource_video` | `/video/[slug]` | `video` | `RESOURCE_VIDEO_*` |
| `resource_single_video` | `/videos/[slug]` | `single_video` | `RESOURCE_SINGLE_VIDEO_*` | `resource_video` | `/video/[slug]` | `video` | `RESOURCE_VIDEO_*` |
| `resource_conversation` | `/conversations/[slug]` | `conversation` | `RESOURCE_CONVERSATION_*` | `resource_audio` | `/audio/[slug]` | `audio` | `RESOURCE_AUDIO_*` |
| _(new)_ | — | — | — | `resource_written` | `/written/[slug]` | `written` | `RESOURCE_WRITTEN_*` |

### Known inconsistencies to fix along the way

- **Enum value mismatch across repos.** `bloom-frontend/lib/constants/enums.ts` has
  `RESOURCE_CATEGORIES.CONVERSATION = 'resource_conversation'`; `bloom-backend/src/utils/constants.ts`
  has `CONVERSATION = 'conversation'`. The DB stores `conversation` (written by the webhook);
  GA receives `resource_conversation`. Unify to `audio`.
- **`resource_short` vs `resource_short_video`.** `app/[locale]/shorts/[slug]/page.tsx`
  `generateStaticParams()` filters `component: { in: 'resource_short' }`, but `resolve_relations`,
  `StoryblokRelatedContent.tsx`, and the backend all use `resource_short_video`. Confirm the
  actual Storyblok name (landmine L1) and make it consistent.
- **Stale event constants.** `lib/constants/events.ts` declares
  `RESOURCE_CONVERSATION_STARTED/PLAYED/PAUSED/FINISHED` ("applied using eventPrefix"), but the
  audio player actually emits `RESOURCE_CONVERSATION_AUDIO_*`. The non-`_AUDIO_` variants are
  unused. Don't carry them forward.
- **Double-word events.** `eventPrefix="RESOURCE_SINGLE_VIDEO"` + `components/video/Video.tsx`
  produces `RESOURCE_SINGLE_VIDEO_VIDEO_STARTED`. Choose a clean convention (Phase 3.5) and
  make `bloom-backend/src/reporting/reporting.events.ts` match exactly.
- **`resource.category` is only written on INSERT** (`webhooks.service.ts` `updatedStoryData`
  omits it). Existing rows will not self-heal — Phase 2.4 migration + a webhook change are both
  required.

### Every file that references the types

**bloom-frontend — enums / constants**
- `lib/constants/enums.ts` — `RESOURCE_CATEGORIES` (`SHORT_VIDEO`, `SINGLE_VIDEO`, `CONVERSATION`); `STORYBLOK_TAGS.SOMATICS`; `RELATED_CONTENT_CATEGORIES` union.
- `lib/constants/events.ts` — all `RESOURCE_SHORT_VIDEO_*`, `RESOURCE_CONVERSATION_*`, `RESOURCE_SINGLE_VIDEO_*` constants (`_VIEWED`, `_PLAYED`, `_PAUSED`, `_FINISHED`, `_STARTED_REQUEST/_SUCCESS/_ERROR`, `_COMPLETE_REQUEST/_SUCCESS/_ERROR`, `_TRANSCRIPT_OPENED/_CLOSED`, `_VISIT_SESSION`).

**bloom-frontend — routes / pages**
- `app/[locale]/shorts/[slug]/page.tsx`
- `app/[locale]/conversations/[slug]/page.tsx`
- `app/[locale]/videos/[slug]/page.tsx`
- `app/[locale]/[slug]/page.tsx` — `excludePaths` contains `'shorts'`, `'videos'`, `'conversations'`.

**bloom-frontend — guards / access**
- `components/guards/AuthGuard.tsx` — authenticated path heads include `'conversations'`, `'videos'` (not `'shorts'`).
- `lib/utils/libraryData.ts` — `AUTHENTICATED_PATH_HEADS = ['videos', 'conversations']`, `pathRequiresAccount()`.

**bloom-frontend — Storyblok page components**
- `components/storyblok/StoryblokResourceShortPage.tsx` — `component: 'resource_short_video'`, `RESOURCE_CATEGORIES.SHORT_VIDEO` ×2, `RESOURCE_SHORT_VIDEO_VIEWED`, `<SignUpSection source="resource-short">`, `StoryblokResourceShortPageProps`.
- `components/storyblok/StoryblokResourceConversationPage.tsx` — `component: 'resource_conversation'`, `RESOURCE_CATEGORIES.CONVERSATION` ×2, `RESOURCE_CONVERSATION_VIEWED`, `StoryblokResourceConversationPageProps`.
- `components/storyblok/StoryblokResourceSingleVideoPage.tsx` — `component: 'resource_single_video'`, `RESOURCE_CATEGORIES.SINGLE_VIDEO` ×2, `RESOURCE_SINGLE_VIDEO_VIEWED`, `StoryblokResourceSingleVideoPageProps`.
- `components/storyblok/StoryblokRelatedContent.tsx` — imports all three `*PageProps` into a union; branches on `story.content.component === 'resource_short_video'`; derives `category` from lowercased component name → `RelatedContentCard`.
- `components/storyblok/StoryblokResourceCarousel.tsx` + `components/common/ResourceCarousel.tsx` — `switch (component)` on the three names; `RESOURCE_CATEGORIES.*`.
- `components/storyblok/StoryblokCoursePage.tsx` (~L141–148) — `libraryStories` object literal with keys `shorts: []`, `somatics: []`, `conversations: []`.
- `lib/storyblok.ts` + `lib/utils/richText.tsx` — register `resource_carousel` (the resource page components are NOT registered here; routed via app router).

**bloom-frontend — resource player / header components**
- `components/resources/ResourceShortVideo.tsx` — 8 `RESOURCE_SHORT_VIDEO_*` imports, `eventPrefix="RESOURCE_SHORT"`.
- `components/resources/ResourceSingleVideo.tsx` — 8 `RESOURCE_SINGLE_VIDEO_*` imports, `eventPrefix="RESOURCE_SINGLE_VIDEO"`.
- `components/resources/ResourceConversationAudio.tsx` — 8 `RESOURCE_CONVERSATION_*` imports, `eventPrefix="RESOURCE_CONVERSATION"`.
- `components/resources/ResourceCompleteButton.tsx` — imports the 9 `*_COMPLETE_*` constants; 3× nested ternary on `category`.
- `components/resources/ResourceShortsHeader.tsx` (exports `ResourceShortHeader`) — `RESOURCE_SHORT_VIDEO_VISIT_SESSION`, `getNextResourceButtonLabel`, i18n `Resources.sessionDetail`/`sessionButtonLabel`.
- `components/resources/ResourceSingleVideoHeader.tsx` — `getNextResourceButtonLabel`, visit-session event.
- `components/resources/ResourceConversationHeader.tsx` — `getNextResourceButtonLabel`.
- `components/resources/ResourceSingleVideo.tsx` / `ResourceShortVideo.tsx` also own the "this clip is from Session X / Course Y" block.

**bloom-frontend — utils / hooks**
- `lib/utils/getLibraryStories.ts` — `LibraryStories` shape `{ courses, courseSessions, shorts, somatics, conversations }`; parallel `getAllStoryblokStories` with `starts_with: 'shorts/'`, `starts_with: 'videos/' + with_tag: STORYBLOK_TAGS.SOMATICS`, `starts_with: 'conversations/'`.
- `lib/utils/libraryData.ts` — `LibraryStories` interface; `FORMAT_BY_COMPONENT` (`resource_conversation: 'audio'`, `resource_short_video: 'video'`, `resource_single_video: 'video'`, `Session`/`session_iba: 'video'`); header comment; `Format` union (already `'audio' | 'written' | 'video' | 'activity'`); `FORMAT_KEYS`.
- `lib/hooks/useLibraryItems.ts` — `const resourceStories = [...stories.shorts, ...stories.somatics, ...stories.conversations]`.
- `lib/utils/getNextResourceButtonLabel.ts` — `/conversations/` → `'nextConversationButtonLabel'`, `/courses/` → `'nextSessionButtonLabel'`, else `'nextVideoButtonLabel'`.

**bloom-frontend — cards / forms / store**
- `components/cards/ResourceCard.tsx` — `t(\`relatedContent.resource_${category}\`)`; default image `src="/bloom_shorts.png"` + alt `'Bloom shorts default image'` (+ a TODO).
- `components/cards/RelatedContentCard.tsx` — `t(category)` (lowercased component name).
- `components/forms/ResourceFeedbackForm.tsx` — `category: RESOURCE_CATEGORIES` prop; `RESOURCE_FEEDBACK_SUBMITTED` `{ category }`.
- `lib/store/resourcesSlice.tsx` — `Resource.category: RESOURCE_CATEGORIES`.
- `lib/api.ts` — no change (`startResource`/`completeResource`/`createResourceFeedback` keyed on uuid/id).

**bloom-frontend — i18n** (`i18n/messages/<ns>/{en,de,es,fr,hi,pt,tr,ar}.json`)
- `resources/*.json` `Resources`: `nextVideoButtonLabel`, `nextConversationButtonLabel`, `nextSessionButtonLabel`, `conversations`, `shorts`, `videos`, `sessionDetail`, `sessionButtonLabel`, `videoTranscriptLink`, `conversationTranscriptLink`, `relatedContent.resource_short_video`, `relatedContent.resource_single_video`, `relatedContent.resource_conversation`, `resourceFeedback.title` ("How was this session?").
- `library/*.json` `Library.contentTypes` — already `{ course, audio, written, video, activity }`. **Verify `written` wording in all 8 locales** (only `en` = "Written" confirmed).
- `scripts/checkTranslation.js` — auto-discovers keys; no code change, but CI fails on key-parity drift across locales.

**bloom-frontend — static / SEO**
- `public/sitemap.xml` — ~90 `<loc>` entries under `/shorts/`, `/conversations/`, `/videos/` (× locales). **No generator exists in the repo** — it is hand-maintained or externally produced (landmine L2).
- `public/robots.txt` — no resource paths; no change.
- `next.config.js` `redirects()` — no resource redirects today; add here.

**bloom-frontend — tests**
- `lib/utils/libraryData.test.ts` — `component: 'resource_conversation'`, `/videos/a-somatic-video`, `de/videos/somatic`.
- `lib/hooks/useLibraryItems.test.ts` — `somatics: []`, `shorts: []` in mock `LibraryStories`.
- `cypress/integration/user-content/shorts.cy.tsx` — "Shorts Flow".
- `cypress/integration/user-content/conversations.cy.tsx` — "Conversations Flow".
- `cypress/integration/user-content/videos.cy.tsx` — "What is somatics" flow, `a[aria-label="What is somatics?"]`.
- `cypress/integration/user-content/library.cy.tsx` — `somatics` search, "Somatics content is all single sessions".
- `cypress/integration/system/sitemap.cy.tsx` — generic sitemap assertions.

**bloom-backend**
- `src/utils/constants.ts` — `RESOURCE_CATEGORIES` (`SHORT_VIDEO='short_video'`, `SINGLE_VIDEO='single_video'`, `CONVERSATION='conversation'`); `STORYBLOK_PAGE_COMPONENTS` (`RESOURCE_SINGLE_VIDEO`, `RESOURCE_SHORT_VIDEO`, `RESOURCE_CONVERSATION`).
- `src/entities/resource.entity.ts` — `@Column() category` (varchar, per migration `1733160378757-bloom-backend.ts`).
- `src/resource/dtos/create-resource.dto.ts` — `@IsEnum(RESOURCE_CATEGORIES) category`.
- `src/resource/resource.interface.ts` — `category?: RESOURCE_CATEGORIES`.
- `src/webhooks/webhooks.service.ts` (~L470–508) — `updateOrCreateStoryData`: matches the three `STORYBLOK_PAGE_COMPONENTS.RESOURCE_*`, maps component → category, writes `category` **only on create**; returns `undefined` for unknown components.
- `src/reporting/reporting.events.ts` — `EVENT_GROUPS` topic `'resources'` + "Resource errors" group + flat `ERROR_EVENTS` list. Event names: `RESOURCE_CONVERSATION_VIEWED`, `RESOURCE_CONVERSATION_AUDIO_STARTED/_FINISHED`, `RESOURCE_SHORT_VIDEO_VIEWED/_STARTED/_FINISHED`, `RESOURCE_SINGLE_VIDEO_VIEWED/_VIDEO_STARTED/_VIDEO_FINISHED`, `RESOURCE_SHORT_VIDEO_VISIT_SESSION`, `RESOURCE_SINGLE_VIDEO_VISIT_SESSION`, `RESOURCE_{CONVERSATION,SHORT_VIDEO,SINGLE_VIDEO}_{STARTED,COMPLETE}_ERROR`.
- `src/reporting/reporting.types.ts` — `DbResourceCategoryBreakdownRow.category` doc comment.
- `src/reporting/slack-blocks.builder.ts` (~L48–50) — `RESOURCE_CATEGORY_LABELS = { short_video, single_video, conversation }`; used ~L807.
- `src/reporting/db-metrics.service.ts` (~L271–284, L383–421) — `SELECT r.category … GROUP BY r.category` (any string works).
- `src/reporting/ga4-metrics.service.ts` — issues GA4 Data API requests keyed by `reporting.events.ts` event names.
- Tests: `src/webhooks/webhooks.service.spec.ts`, `test/utils/mockData.ts`, `src/reporting/db-metrics.service.spec.ts`, `src/reporting/slack-blocks.builder.spec.ts`, `src/reporting/__snapshots__/*`.

### External systems

- **Storyblok CMS** — block library definitions; content folders `shorts/`, `conversations/`,
  `videos/`; the `somatics` tag; `related_content` / `related_session` / `related_course`
  reference fields; the `resource_carousel` blok's `resources` field; every story referencing a
  resource (course/session pages, welcome pages, rich-text `resource_carousel` inserts). Publish
  webhook → `bloom-backend` `/webhooks/storyblok`.
- **Google Analytics 4** — event names + `resource_category` custom dimension. Custom-dimension
  registration, key-event flags, saved explorations, audiences, and **Looker Studio** dashboards
  filter on the current names. GA4 **cannot** rename historical events.
- **Vercel Analytics** — `track(event, params)` custom events; renamed strings start new series.
- **bloom-backend Slack reporting** — built from GA4 Data API by event name + from
  `resource.category` DB grouping. Both need updating; historical report periods still query old
  names.
- **Google Search / inbound links** — indexed `/shorts/*`, `/conversations/*`, `/videos/*` URLs;
  partner sites, newsletters, social posts may deep-link.

---

## Phase 0 — Pre-flight (no code)

- [ ] Get answers to decisions **A–G** above.
- [ ] Confirm the real Storyblok component name for shorts (L1): inspect a published short
      story's `content.component` via the Storyblok API.
- [ ] Confirm whether a Storyblok **staging space** exists to dry-run the content migration.
- [ ] Identify the owner + inventory of GA4 explorations / Looker Studio dashboards that
      reference `RESOURCE_SHORT_VIDEO_*` / `RESOURCE_CONVERSATION_*` / `RESOURCE_SINGLE_VIDEO_*`
      or `resource_category`.
- [ ] Locate the `public/sitemap.xml` generation process (L2).
- [ ] Decide the transition window length for keeping old GA event names in
      `reporting.events.ts` (recommend 2 reporting cycles).

---

## Phase 1 — Shared prep

- [ ] Agree the exact final event-name list (write it down): for each of `VIDEO`, `AUDIO`,
      `WRITTEN` — `RESOURCE_<T>_VIEWED`, `RESOURCE_<T>_STARTED_REQUEST/_SUCCESS/_ERROR`,
      `RESOURCE_<T>_COMPLETE_REQUEST/_SUCCESS/_ERROR`, `RESOURCE_<T>_TRANSCRIPT_OPENED/_CLOSED`
      (video + audio only), `RESOURCE_<T>_VISIT_SESSION` (video only), and player sub-events
      `RESOURCE_<T>_<MEDIA>_STARTED/_PLAYED/_PAUSED/_FINISHED`. Decide the sub-event convention
      (recommend: set `eventPrefix="RESOURCE_VIDEO"` and change `components/video/Video.tsx` +
      `Audio.tsx` so the suffix is `_STARTED` etc., giving `RESOURCE_VIDEO_STARTED` — but that
      collides with the RTK `_STARTED_REQUEST` family, so instead keep media word:
      `RESOURCE_VIDEO_VIDEO_STARTED` / `RESOURCE_AUDIO_AUDIO_STARTED`. Pick and document.)
- [ ] Agree canonical strings: `video`, `audio`, `written` (decision 5).

---

## Phase 2 — bloom-backend + Storyblok (must ship before Phase 3)

### 2.1 Storyblok block library (human, in Storyblok)

- [ ] Create block `resource_video` — field schema = superset of `resource_short_video` and
      `resource_single_video`:
      `name`, `subtitle?`, `description` (richtext), `duration`, `video` (asset/oembed),
      `video_transcript` (richtext), `page_sections`, `team_members_section?`,
      `related_content`, `related_exercises`, `related_session`, `related_course`,
      `references?`, `languages`, `included_for_partners`, `seo_description`, `preview_image`,
      and (per decision A) an optional `requires_account` boolean if per-story gating is chosen.
- [ ] Create block `resource_audio` — = current `resource_conversation` schema:
      `name`, `description`, `header_image`, `duration`, `audio` (asset), `audio_transcript`
      (richtext), `page_sections`, `related_content`, `related_exercises`, `languages`,
      `included_for_partners`, `seo_description`.
- [ ] Create block `resource_written` (new) — proposed:
      `name`, `subtitle?`, `description` (richtext, intro/summary), `duration` (est. read time),
      `body` (richtext — the article), `page_sections`, `related_content`, `related_exercises`,
      `references?`, `related_session?`, `related_course?`, `languages`,
      `included_for_partners`, `seo_description`, `preview_image`. Confirm with content team (D).
- [ ] Create folders `video/`, `audio/`, `written/`; set each folder's default content type.
- [ ] Do **not** delete `resource_short_video` / `resource_single_video` / `resource_conversation`
      or their folders yet.

### 2.2 bloom-backend — constants (backwards-compatible)

- [ ] `src/utils/constants.ts`:
  - `RESOURCE_CATEGORIES` → add `VIDEO = 'video'`, `AUDIO = 'audio'`, `WRITTEN = 'written'`.
    Keep the old members for now (or remove and map in the webhook — see 2.3).
  - `STORYBLOK_PAGE_COMPONENTS` → add `RESOURCE_VIDEO = 'resource_video'`,
    `RESOURCE_AUDIO = 'resource_audio'`, `RESOURCE_WRITTEN = 'resource_written'`. Keep the old
    three.

### 2.3 bloom-backend — webhook

- [ ] `src/webhooks/webhooks.service.ts` `updateOrCreateStoryData`:
  - Recognise the union of old + new resource components in the `if (…)` guard.
  - Map component → category: `resource_short_video | resource_single_video | resource_video →
    'video'`; `resource_conversation | resource_audio → 'audio'`; `resource_written → 'written'`.
  - **Add `category` to the fields written on update**, not just create — so re-published
    stories in Phase 2.5 correct their `category`. (Derive it every time from the component;
    include it in `updatedStoryData` or in the `existingResource` merge.)
  - Keep the `undefined` fall-through for non-resource components.
- [ ] Update `src/webhooks/webhooks.service.spec.ts` fixtures + expected `category` values.
- [ ] Update `test/utils/mockData.ts` (`component`, `category`).

### 2.4 bloom-backend — data migration

- [ ] New `src/migrations/<timestamp>-bloom-backend.ts`:
  - `up()`:
    - `UPDATE "resource" SET "category" = 'video' WHERE "category" IN ('short_video','single_video');`
    - `UPDATE "resource" SET "category" = 'audio' WHERE "category" = 'conversation';`
  - `down()`: lossy — document that it maps `video → 'single_video'`, `audio → 'conversation'`
    (short vs single is unrecoverable; acceptable since `category` is reporting-only).
- [ ] Run against a seeded local DB, then staging; record before/after row counts per category.

### 2.5 bloom-backend — reporting (dual old+new for the transition window)

- [ ] `src/reporting/reporting.events.ts`:
  - In the `'resources'` `EVENT_GROUPS` topic, the "Resource errors" group, and the flat
    `ERROR_EVENTS` list — **add** the new event names (`RESOURCE_VIDEO_*`, `RESOURCE_AUDIO_*`,
    `RESOURCE_WRITTEN_*`) alongside the old ones. Label old rows e.g. "(pre-cutover)".
  - Make the player sub-event names match Phase 1's decision exactly.
- [ ] `src/reporting/slack-blocks.builder.ts` `RESOURCE_CATEGORY_LABELS` — add
      `video: 'Videos'`, `audio: 'Audio'`, `written: 'Written'`. Keep old keys as fallback.
- [ ] `src/reporting/reporting.types.ts` — update the `DbResourceCategoryBreakdownRow.category`
      doc comment.
- [ ] Update `src/reporting/db-metrics.service.spec.ts`, `src/reporting/slack-blocks.builder.spec.ts`.
- [ ] Regenerate `src/reporting/__snapshots__/*` deliberately (`yarn test -u`), review the diff.

### 2.6 bloom-backend — verify + deploy

- [ ] `yarn type-check`, `yarn lint`, `yarn test`, `yarn migration:run` locally.
- [ ] Deploy backend. Verify on staging: publish a still-old resource story in Storyblok →
      backend logs `Storyblok resource … success` and the `resource` row now has the new
      `category`.

### 2.7 Storyblok content migration (human + Management API script)

- [ ] Write a Management API script that, for every resource story:
  - `shorts/*` and `videos/*` → move into `video/`, set `content.component = 'resource_video'`,
    remap fields (old shorts have no `subtitle`/`team_members_section`/`references` → leave
    unset).
  - `conversations/*` → move into `audio/`, set `content.component = 'resource_audio'`.
  - **Preserve each story's `uuid`** (join key to `resource.storyblokUuid` / `resource_user` /
    `resource_feedback`). Moving a story keeps its uuid; only `full_slug` changes.
  - Handle every locale's `translated_slugs`.
  - Emit a `{ uuid, locale, oldFullSlug, newFullSlug }` manifest → feeds Phase 3.8 redirects
    + the sitemap regen.
- [ ] Verify `related_content` / `related_session` / `related_course` / `resource_carousel.resources`
      are stored as story references (uuid-based) and survive the move. Remap any stored as raw
      slug strings.
- [ ] Freeze resource editing; announce the new folder structure to editors.
- [ ] Run the script (dry-run first if a staging space exists). **Publish** all migrated
      stories in controlled batches; watch backend logs + Rollbar. Each publish upserts the
      `resource` row's `slug` + `category`.
- [ ] Keep old block definitions + now-empty old folders until Phase 4.

---

## Phase 3 — bloom-frontend (ship after Phase 2.7 completes)

### 3.1 Enums & constants

- [ ] `lib/constants/enums.ts`:
  - `RESOURCE_CATEGORIES` → `VIDEO = 'video'`, `AUDIO = 'audio'`, `WRITTEN = 'written'`.
  - Remove `STORYBLOK_TAGS.SOMATICS` usage (keep or drop the enum per decision 7).
  - Keep `RELATED_CONTENT_CATEGORIES` composing from `RESOURCE_CATEGORIES`; align the i18n key
    derivation in cards (3.7).
- [ ] `lib/constants/events.ts`:
  - Replace `RESOURCE_SHORT_VIDEO_*` and `RESOURCE_SINGLE_VIDEO_*` with `RESOURCE_VIDEO_*`.
  - Replace `RESOURCE_CONVERSATION_*` with `RESOURCE_AUDIO_*`.
  - Add the `RESOURCE_WRITTEN_*` set (only the suffixes decision B/Phase 1 call for).
  - Drop the stale non-`_AUDIO_` conversation constants.
  - Add a comment block mapping old → new names for the analytics transition.

### 3.2 Routes

- [ ] Create `app/[locale]/video/[slug]/page.tsx`, `app/[locale]/audio/[slug]/page.tsx`,
      `app/[locale]/written/[slug]/page.tsx`, based on the existing three pages:
  - `getStoryblokStory('video/${slug}' | 'audio/${slug}' | 'written/${slug}', …)`.
  - `resolve_relations`:
    - video: `['resource_video.related_content', 'resource_video.related_session', 'resource_video.related_session.course']`
    - audio: `['resource_audio.related_content']`
    - written: `['resource_written.related_content', 'resource_written.related_session', 'resource_written.related_session.course']` (only if written supports related session — decision D).
  - `generateStaticParams` `filter_query.component.in`: `'resource_video'` / `'resource_audio'`
    / `'resource_written'`. **Fix the `resource_short` bug here.**
  - `generateMetadata` `titleParent: t('video' | 'audio' | 'written')`.
  - Port the `related_session` → related-course resolution logic from the old shorts page into
    the video page.
- [ ] Delete `app/[locale]/shorts/`, `app/[locale]/conversations/`, `app/[locale]/videos/`.
- [ ] `app/[locale]/[slug]/page.tsx` — in `excludePaths`, replace `'shorts'`, `'videos'`,
      `'conversations'` with `'video'`, `'audio'`, `'written'`.

### 3.3 Guards & access (decision A)

- [ ] `components/guards/AuthGuard.tsx` — set the authenticated path heads to match the chosen
      rule: e.g. `['video', 'audio']` (+ `'written'` if decision C says so), or none of them if
      all resources become public.
- [ ] `lib/utils/libraryData.ts` `AUTHENTICATED_PATH_HEADS` — mirror `AuthGuard` exactly.
- [ ] If per-story gating (A-c): add the `requires_account` field handling in the video page +
      `pathRequiresAccount` / `hasAccessToPage`.

### 3.4 Storyblok page components

- [ ] Merge `StoryblokResourceShortPage.tsx` + `StoryblokResourceSingleVideoPage.tsx` →
      `StoryblokResourceVideoPage.tsx`:
  - `component: 'resource_video'`; `StoryblokResourceVideoPageProps`.
  - `RESOURCE_CATEGORIES.VIDEO`; `RESOURCE_VIDEO_VIEWED`; `<SignUpSection source="resource-video">`.
  - Render `subtitle` / `team_members_section` / `references` behind presence checks.
  - Keep the "this clip is from Session X" block conditional on `related_session`.
- [ ] Rename `StoryblokResourceConversationPage.tsx` → `StoryblokResourceAudioPage.tsx`
      (`component: 'resource_audio'`, `RESOURCE_CATEGORIES.AUDIO`, `RESOURCE_AUDIO_VIEWED`,
      `source="resource-audio"`).
- [ ] Create `StoryblokResourceWrittenPage.tsx` (new) — renders `body` richtext; wires
      progress/feedback only if decision B says so; `RESOURCE_WRITTEN_VIEWED`.
- [ ] `components/storyblok/StoryblokRelatedContent.tsx` — update the `content` union types; the
      `component === 'resource_short_video'` branch → `'resource_video'` (decide whether the
      `included_for_partners` filter now applies to all resource types); the `category`
      derivation feeding `RelatedContentCard`.
- [ ] `components/common/ResourceCarousel.tsx` — `switch (component)` cases → `'resource_video'`,
      `'resource_audio'`, `'resource_written'`; category props; decide the card component for
      `written`.
- [ ] `components/storyblok/StoryblokCoursePage.tsx` (~L141–148) — update the `libraryStories`
      literal keys to the new `LibraryStories` shape (3.6).
- [ ] Verify `resolve_relations: ['resource_carousel.resources']` in
      `app/[locale]/welcome/[partnerName]/page.tsx` still resolves after the folder moves
      (uuid-based — should be fine; confirm).

### 3.5 Resource player / header components

- [ ] Merge `ResourceShortVideo.tsx` + `ResourceSingleVideo.tsx` → `ResourceVideo.tsx`;
      `RESOURCE_VIDEO_*` imports; single `eventPrefix` per Phase 1 decision.
- [ ] Rename `ResourceConversationAudio.tsx` → `ResourceAudio.tsx`; `RESOURCE_AUDIO_*`.
- [ ] Add `ResourceWrittenBody.tsx` (+ header) — new.
- [ ] `components/resources/ResourceCompleteButton.tsx` — collapse the nested ternary to
      `category === VIDEO ? RESOURCE_VIDEO_COMPLETE_* : category === AUDIO ? RESOURCE_AUDIO_COMPLETE_* : RESOURCE_WRITTEN_COMPLETE_*`.
- [ ] Merge `ResourceShortsHeader.tsx` + `ResourceSingleVideoHeader.tsx` → `ResourceVideoHeader.tsx`
      (`RESOURCE_VIDEO_VISIT_SESSION`). Rename `ResourceConversationHeader.tsx` → `ResourceAudioHeader.tsx`.
- [ ] `components/video/Video.tsx` + `components/video/Audio.tsx` — adjust the `${eventPrefix}_…`
      suffix if Phase 1 changed the convention.
- [ ] `lib/utils/getNextResourceButtonLabel.ts` — replace the `/conversations/` check with
      `/audio/`; add `/written/`; return keys `nextAudioButtonLabel` / `nextVideoButtonLabel` /
      `nextWrittenButtonLabel` / `nextSessionButtonLabel`. Update the i18n keys (3.9) and the
      header components that call `t(getNextResourceButtonLabel(...))`.

### 3.6 Library data

- [ ] `lib/utils/getLibraryStories.ts` — change `LibraryStories` to
      `{ courses, courseSessions, videos, audios, writtens }` (or a single flat `resources`
      array — simpler, recommended). Queries: `starts_with: 'video/'`, `'audio/'`, `'written/'`.
      **Drop `with_tag: STORYBLOK_TAGS.SOMATICS`.** Consider one query with
      `filter_query: { component: { in: 'resource_video,resource_audio,resource_written' } }`.
- [ ] `lib/utils/libraryData.ts` — update the `LibraryStories` interface; `FORMAT_BY_COMPONENT`
      → `resource_video: 'video'`, `resource_audio: 'audio'`, `resource_written: 'written'`
      (keep `Session`/`session_iba: 'video'`); update the header comment.
- [ ] `lib/hooks/useLibraryItems.ts` — update `resourceStories` construction.
- [ ] `components/storyblok/StoryblokCoursePage.tsx` — `libraryStories` literal (also touched in 3.4).

### 3.7 Cards / forms / store

- [ ] `components/cards/ResourceCard.tsx` — align the i18n key lookup with 3.9
      (`t(\`relatedContent.${category}\`)` or similar); replace/keep `/bloom_shorts.png` default
      + fix the alt string + TODO.
- [ ] `components/cards/RelatedContentCard.tsx` — ensure `t(category)` keys exist for the new
      component/category names.
- [ ] `components/forms/ResourceFeedbackForm.tsx` — type unchanged; `RESOURCE_FEEDBACK_SUBMITTED`
      `{ category }` now emits `video`/`audio`/`written`. Gate the form for `written` per
      decision B.
- [ ] `lib/store/resourcesSlice.tsx` — `Resource.category` type name unchanged; values follow
      the enum.

### 3.8 Redirects & sitemap

- [ ] `next.config.js` `redirects()` — add, using the existing `LOCALE_PATTERN` style:
      - `/shorts/:slug` + `/:locale/shorts/:slug` → `/video/:slug` (permanent).
      - `/videos/:slug` + `/:locale/videos/:slug` → `/video/:slug` (permanent).
      - `/conversations/:slug` + `/:locale/conversations/:slug` → `/audio/:slug` (permanent).
      - If any individual slugs changed (not just the folder segment), add explicit per-slug
        redirects generated from the Phase 2.7 manifest.
- [ ] Regenerate `public/sitemap.xml` via the process found in Phase 0 (new `/video/`,
      `/audio/`, `/written/` URLs; drop the old ones).

### 3.9 i18n (all 8 locales: `en, de, es, fr, hi, pt, tr, ar`)

- [ ] `i18n/messages/resources/*.json` `Resources`:
  - `shorts` → `video`; `conversations` → `audio`; repurpose/remove `videos`; add `written`
    (breadcrumb `titleParent` labels).
  - `nextConversationButtonLabel` → `nextAudioButtonLabel`; add `nextWrittenButtonLabel`; keep
    `nextVideoButtonLabel`, `nextSessionButtonLabel`.
  - `relatedContent.resource_short_video` + `resource_single_video` → single
    `relatedContent.resource_video` ("Watch"); `resource_conversation` → `resource_audio`
    ("Listen"); add `resource_written` ("Read"). Keep `course`, `session`, `session_iba`,
    `grounding`, `activities`, `minuteLabel`, `title`.
  - `conversationTranscriptLink` → `audioTranscriptLink` (rename key; reword value if needed).
  - `sessionDetail`, `sessionButtonLabel` — keep.
  - `resourceFeedback.title` "How was this session?" — reword if it now covers written.
- [ ] `i18n/messages/library/*.json` `Library.contentTypes` — already has `video`/`audio`/`written`;
      **verify the `written` translation in all 8 locales** (only `en` confirmed). For `ar`/`tr`
      follow the register guidance in `docs/` / memory (`translation-register-ar-tr`).
- [ ] Run `node scripts/checkTranslation.js` — must pass (key parity across all 8 locales).

### 3.10 Tests

- [ ] `lib/utils/libraryData.test.ts` — `resource_conversation` → `resource_audio`;
      `/videos/...` → `/video/...`; `de/videos/...` → `de/video/...`; `FORMAT_BY_COMPONENT`
      expectations.
- [ ] `lib/hooks/useLibraryItems.test.ts` — mock `LibraryStories` keys.
- [ ] `cypress/integration/user-content/shorts.cy.tsx` + `videos.cy.tsx` → merge into
      `video.cy.tsx`; update flows, paths, selectors, the "somatics" search term.
- [ ] `cypress/integration/user-content/conversations.cy.tsx` → `audio.cy.tsx`; `/conversations/`
      → `/audio/`.
- [ ] `cypress/integration/user-content/library.cy.tsx` — update the `somatics` search
      assertions and the "single sessions" comment.
- [ ] Add `cypress/integration/user-content/written.cy.tsx` if `written` ships with a user flow.
- [ ] `yarn type-check`, `yarn lint`, `yarn test`, then `yarn cypress:headless` (needs a seeded
      local DB whose `resource` rows use the new `category` strings and Storyblok fixtures whose
      `component` matches).

### 3.11 Deploy

- [ ] Merge to `develop` → auto-deploys to staging (Vercel). Verify on staging (see Phase 5),
      then `develop` → `main` for production.

---

## Phase 4 — Cleanup (after Phase 3 verified in production)

- [ ] bloom-frontend: delete any leftover old i18n keys, old event-name comments once analytics
      is confirmed, the `bloom_shorts.png` asset if renamed.
- [ ] bloom-backend: remove old `RESOURCE_CATEGORIES` members, old `STORYBLOK_PAGE_COMPONENTS`
      members, old event names from `reporting.events.ts`, old `RESOURCE_CATEGORY_LABELS` keys —
      after the agreed transition window.
- [ ] Storyblok: delete the `resource_short_video` / `resource_single_video` /
      `resource_conversation` block definitions and the empty `shorts/` / `conversations/` /
      `videos/` folders.
- [ ] GA4 / Looker Studio: repoint dashboards, explorations, audiences to the new event names +
      `resource_category` values. Register the new `written` events / mark key events.
- [ ] Annotate the cutover date in GA4.

---

## Phase 5 — Verification checklist (run on staging, then production)

- [ ] Publishing a resource story in Storyblok upserts the `resource` row with the correct new
      `category` (check backend logs + DB).
- [ ] `resource-user` start/complete still records progress (story `uuid` unchanged).
- [ ] Library `Content type` filter shows `Video` / `Audio` / `Written` and each returns the
      right items.
- [ ] Previously-somatic videos still appear; decision E behaviour is correct.
- [ ] GA4 DebugView shows `RESOURCE_VIDEO_*` / `RESOURCE_AUDIO_*` / `RESOURCE_WRITTEN_*` with
      `resource_category` = `video`/`audio`/`written`.
- [ ] Old URLs 301 to new URLs — spot-check `/shorts/<slug>`, `/conversations/<slug>`,
      `/videos/<slug>` for **every** locale.
- [ ] `sitemap.xml` lists the new URLs, not the old.
- [ ] Related-content carousels on course/session/welcome pages still resolve.
- [ ] The weekly Slack report renders the resource breakdown with the new labels.
- [ ] `written` page renders, is reachable from the library, and (if applicable) "mark complete"
      + feedback work.

---

## Rollback

| Layer | Rollback |
|---|---|
| bloom-backend deploy | Revert PR (webhook still understands old components — they were kept). Migration `down()` is lossy but safe (`category` is reporting-only). |
| Storyblok migration | Reverse script: move stories back, restore `content.component`. Uuids preserved → backend re-syncs on publish. Old blocks still exist. Keep the manifest. |
| bloom-frontend deploy | Revert PR. **Caveat:** if Storyblok is already migrated, the old frontend can't find stories in old folders → 404. So either roll back frontend + Storyblok together, or keep old folders populated until the new frontend is confirmed in production. |
| Redirects | Remove from `next.config.js`. |
| GA4 | No rollback for split history. Dashboards recover by repointing filters. |

The **safe ordering** keeps old Storyblok folders/blocks alive and the backend
dual-compatible until the new frontend is verified in production, so any single layer can
revert independently.

---

## Landmines

- **L1 — `resource_short` vs `resource_short_video`.** `app/[locale]/shorts/[slug]/page.tsx`
  `generateStaticParams` filters `component: { in: 'resource_short' }`; everything else uses
  `resource_short_video`. Confirm the true name in Storyblok before scripting Phase 2.7.
- **L2 — no sitemap generator in the repo.** `public/sitemap.xml` appears hand-maintained /
  externally generated. Find the real process in Phase 0 or the site will serve stale/404 URLs.
- **L3 — enum value mismatch.** Frontend `CONVERSATION = 'resource_conversation'` vs backend
  `= 'conversation'` vs DB `conversation` vs GA `resource_conversation`. Unify to `audio`.
- **L4 — `category` only written on INSERT.** Phase 2.3 must add it to the update path or
  existing rows never get the new value even after re-publish.
- **L5 — merged `video` route forces one access rule** (decision A). Shorts are public today;
  single videos are gated.
- **L6 — `eventPrefix` double-word.** `RESOURCE_SINGLE_VIDEO` + `Video.tsx` →
  `RESOURCE_SINGLE_VIDEO_VIDEO_STARTED`. Pick a convention in Phase 1 and make
  `reporting.events.ts` match exactly.
- **L7 — dropping `with_tag: somatics`** surfaces previously-hidden `videos/` stories in the
  library (decision E).
- **L8 — `revalidate = 14400` + `dynamicParams = false`** on resource pages: after cutover the
  first prod build regenerates static params from the new folders; old paths hard-404, so
  redirects are mandatory, not optional.
- **L9 — `SignUpSection` `source` prop is `string`** (not a union) — changing the value won't
  break types, but the analytics `sign_up_section_source` param value changes.
- **L10 — Cypress fixtures + seed DB** must be updated to the new `component` / `category`
  strings or E2E fails.
- **L11 — `ar` / `tr` locale files** must keep structural key parity for `checkTranslation.js`,
  even where the register guidance says leave the value in English.
- **L12 — partner welcome pages** embed `resource_carousel` with hand-picked resource refs —
  re-verify resolution after the folder moves (uuid refs should survive).
- **L13 — inconsistent card i18n key derivation.** `ResourceCard` uses
  `relatedContent.resource_${category}`; `RelatedContentCard` uses `t(category)`. Unify.
- **L14 — backend reporting snapshot tests** — regenerate deliberately and review the diff.

---

## Suggested PR sequence

1. **bloom-backend #1** — constants (add new, keep old), webhook dual-recognition +
   `category`-on-update, data migration, reporting dual event lists + label map, spec + snapshot
   updates. Deploy to staging, verify webhook.
2. **Storyblok** — block defs + folders (2.1), then the migration script (2.7); dry-run if a
   staging space exists; execute + publish in batches.
3. **bloom-frontend #1** — everything in Phase 3 (routes, merged components, players/headers,
   new `written` type, enums, events, library data, guards, cards, store, i18n, redirects,
   sitemap, tests). Large — may split routes+components from i18n+tests.
4. **bloom-frontend #2** — delete old routes/components/i18n keys once verified (Phase 4).
5. **bloom-backend #2** — drop old constants + old reporting names + old label keys after the
   transition window (Phase 4).
6. **Analytics** (non-code) — GA4 admin + Looker Studio + dashboard owners (Phase 4).
