# Resource types migration plan

> Replace the ad-hoc resource types with format-based ones, in independently-deployable
> steps. Ship the greenfield types first (**audio, written, activity, grounding** — no
> existing entities, no indexed URLs, no analytics history), then do the risky content
> merge (**shorts + somatic videos + conversations → video / audio**) last, behind
> deploy ordering that keeps every URL resolving throughout.
>
> Touches `bloom-frontend`, `bloom-backend`, Storyblok CMS, and Google Analytics 4.

## End state

| Today         | Component                                | Route                   | →   | Component            | Route                      | `resource.category` |
| ------------- | ---------------------------------------- | ----------------------- | --- | -------------------- | -------------------------- | ------------------- |
| Shorts        | `resource_short_video`                   | `/shorts/[slug]`        | →   | `resource_video`     | `/video/[slug]`            | `video`             |
| Somatics      | `resource_single_video` + `somatics` tag | `/videos/[slug]`        | →   | `resource_video`     | `/video/[slug]`            | `video`             |
| Conversations | `resource_conversation`                  | `/conversations/[slug]` | →   | `resource_audio`     | `/audio/[slug]`            | `audio`             |
| Activities    | flat page + accordion                    | `/activities`           | →   | `resource_activity`  | `/activity/[slug]`         | `activity`          |
| Grounding     | flat page + accordion                    | `/grounding`            | →   | `resource_grounding` | `/grounding?id=` (overlay) | _(no DB row)_       |
| —             | —                                        | —                       | →   | `resource_written`   | `/written/[slug]`          | `written`           |

GA event prefixes become `RESOURCE_{VIDEO,AUDIO,WRITTEN,ACTIVITY,GROUNDING}_*`; `resource_category` param = the category string above.

## Locked decisions

| #   | Decision                                                                                                                                                                                                                      |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Gating:** per-story `login_required` boolean on every resource block, default **true**. The page component reads it and renders the preview + login overlay itself (like `shorts` today) — not `AuthGuard`, not path-based. |
| 2   | **Grounding:** one `/grounding` page, each exercise in an overlay addressed by `?id=<slug>`. No progress, no feedback, not in the library, not in the `Format` union, no backend `resource` row.                              |     |
| 3   | **Merge:** `resource_short_video` + `resource_single_video` → one `resource_video`. Public shorts get `login_required=false` during the move.                                                                                 |
| 4   | **Canonical strings** `video` / `audio` / `written` / `activity` — identical in both repos, the DB column, and GA.                                                                                                            |
| 5   | **GA:** rename events at the merge (step 7). No frontend dual-emit; `bloom-backend/reporting.events.ts` lists old + new for ~2 reporting cycles, then drops old.                                                              |
| 6   | **Old URLs:** permanent (301) redirects.                                                                                                                                                                                      |

### Needs a human

Only: content-team review of the block schemas · the editorial-freeze announcement before step 7 · a GA4/Looker Studio owner for the step-8 repoint · confirm no editor workflow depends on the `somatics` tag. Everything else in Storyblok is scripted.

## Not affected

`resource-user` / `resource-feedback` (keyed on `storyblokUuid` — a folder move keeps the uuid) · Postgres schema beyond `resource.category`'s values/type · partner access, feature flags, Mailchimp, Front, Simplybook.

## Storyblok Management API

Every Storyblok change below is scripted — no manual CMS work.

- Base `https://mapi.storyblok.com/v1/spaces/${STORYBLOK_SPACE_ID}`, header `Authorization: ${STORYBLOK_OAUTH_TOKEN}` (personal OAuth token — **not** the public `NEXT_PUBLIC_STORYBLOK_TOKEN`). Add both to `.env.local` and CI secrets.
- **Components:** `GET|POST|PUT|DELETE /components[/:id]`, body `{ component: { name, display_name, is_root, is_nestable, schema } }`. Resource pages are `is_root: true, is_nestable: false`. A field change is `PUT /components/:id` with the edited `schema`.
- **Stories & folders:** `GET /stories?per_page=100&page=N` (paginate via the `total` response header), `POST /stories`, `PUT /stories/:id` (move = set `parent_id`; rename = set `slug`; **uuid is stable**), `DELETE /stories/:id`, publish via `PUT /stories/:id?publish=1`. Folders are stories with `is_folder: true`. Locale slugs live in the story's `translated_slugs`.
- **Rate limit ≈ 6 req/s** — throttle (`p-limit` ≈ 3 concurrent) with retry/backoff on 429. Every publish fires the bloom-backend webhook, so batch and pace to keep backend load sane.
- Scripts live in `scripts/storyblok/`, accept `--dry-run`, and each writes a JSON manifest of what it changed.

## Deploy sequence (nothing in production breaks at any point)

The rule: **a consumer is deployed before the data it reads changes; data it stops reading is removed only after that deploy is verified in production.**

1. **Backend deploy** (step 1) — webhook recognises old **and** new components. Old content still resolves. _Additive._ **⚠️ Not yet shipped** — see step 1's backend section. Steps 2–3 below proceed without it by staying in draft (unpublished); nothing is published until this lands.
2. **Storyblok: create blocks/folders** (step 1) — invisible to the running frontend. _Additive._ **Done.**
3. **Storyblok: copy activity/grounding content + populate `related_grounding`** (steps 2–3) — new stories in new folders nothing queries yet; `related_grounding` is a field nothing reads yet; `related_exercises` left intact so the live frontend is unchanged. _Additive._ **Step 2 done as drafts** (24 stories, unpublished — publishing waits on the backend deploy in (1)); **step 3 done** (5 stories' `related_grounding` populated + republished — safe pre-backend-deploy since it only touches old, already-recognised components).
4. **Frontend deploy** (step 6, = steps 4+5) — switches `ResourceGroundingSection` to `related_grounding` (populated in 3); ships `/grounding`, `/activity/[slug]`, `/written/[slug]` routes and the `/activities` → library redirect. Old `/shorts` `/videos` `/conversations` routes and the flat `/grounding` `/activities` Storyblok pages untouched (the latter now shadowed). **Step 4 code done** (not yet deployed — step 5 still to come, they ship together); **step 5 not started.**
5. **Post-verify** (end of step 6) — only now: backfill activities into `related_content`, then delete the flat `/grounding` `/activities` Storyblok pages.
6. **Frontend deploy** (step 7a) — `/video/[slug]` + `/audio/[slug]` accept both the new folder path and the old one as a fallback; old routes replaced by 301s. Every URL resolves whether or not its story has moved yet.
7. **Backend migration** (step 7b) — rewrite `resource.category` values + tighten to a PG enum. Reporting-only; no user-facing effect.
8. **Storyblok: move content** (step 7c) — each story's new URL already resolves and each old URL already 301s (both from 7a). No gap.
9. **Frontend deploy** (step 7d) — drop the old-path fallback, restore static generation, regenerate the sitemap.
10. **Cleanup** (step 8) — after the GA transition window: delete old blocks, folders, enum members, i18n keys.

---

## Step 1 — Create resource types for video, audio, written, activity, grounding

**Storyblok** — `scripts/storyblok/01-create-blocks.mjs` (after content-team schema review). **Done** — dry-run by default, `--write --yes` to apply; idempotent; snapshots + manifest to `.storyblok-provision/`.

- `POST /components` for:
  - `resource_video` — superset of `resource_short_video` + `resource_single_video` (`subtitle?`, `team_members_section?`, `references?` optional). Step 7 moves `shorts/*` + `videos/*` into it.
  - `resource_audio` — clone `resource_conversation`'s `schema`.
  - `resource_written`, `resource_activity` — clone `resource_conversation` with `audio` + `audio_transcript` replaced by a single `body` richtext field.
  - `resource_grounding` — minimal (name, description, body, languages, `included_for_partners`, seo). No relations, no gating field, no progress fields.
- All except grounding get `login_required` (boolean, default true), `related_content` (widened to accept every new + old resource type on the new blocks), `related_grounding` (filtered to `resource_grounding`).
- `POST /stories` with `is_folder: true` for `video/`, `audio/`, `written/`, `activity/`, and the grounding folder.
  - **The grounding folder is created as `grounding-exercises/`, not `grounding/`** — the live flat `grounding` page owns that slug until step 6's post-verify delete, and Storyblok slugs are unique among siblings. Steps 2–5 select grounding content by component filter or `starts_with: 'grounding-exercises/'`; **step 5/6 renames `grounding-exercises/` → `grounding/`** once the flat page is deleted. `related_grounding` refs are by uuid, so the rename is transparent to them.
- `PUT /components/:id` on the existing three blocks: add `related_grounding`, widen `related_content` to accept `resource_activity` (step 3 populates them). `related_exercises` / `related_session` left intact.
- Old blocks / folders / flat pages untouched.

- One schema gap found against real content, fixed the same way (idempotent re-run, additive `PUT`): the `body` field's component whitelist on `resource_written` / `resource_activity` / `resource_grounding` was missing `audio` — the real grounding accordion items embed `audio` bloks (some also `video` / `image`). Fixed in `01-create-blocks.mjs`'s `bodyField()` + a convergence pass that widens already-created components; applied live.

**bloom-backend (ship before any content is published) — ⚠️ NOT YET DEPLOYED:**

- `src/utils/constants.ts` — add `VIDEO/AUDIO/WRITTEN/ACTIVITY` to `RESOURCE_CATEGORIES` and `RESOURCE_{VIDEO,AUDIO,WRITTEN,ACTIVITY}` to `STORYBLOK_PAGE_COMPONENTS` (keep old members). No `RESOURCE_GROUNDING` — grounding gets no row.
- `src/webhooks/webhooks.service.ts` `updateOrCreateStoryData` — recognise old + new resource components (not `resource_grounding`); derive `category` from the component and **write it on update, not just create** (fixes the existing insert-only bug); keep the `undefined` fall-through for everything else.
- `src/reporting/` — add the new event names + `RESOURCE_CATEGORY_LABELS` keys alongside the old ones; update specs; regenerate snapshots and review.
- Deploy. Verify: publish a still-old resource story → backend logs success and the `resource` row carries the derived `category`.
- **Until this ships, nothing new may be published** — the webhook doesn't yet recognise `resource_activity` etc., so a publish would either fail to create a `resource` row or (worse) hit the `undefined` fall-through. Step 2 accounts for this: content is created as **drafts**, never published, until this deploy is confirmed live.

## Step 2 — Copy activity + grounding content into resources

**Status: content copied as drafts; publish deferred to the backend deploy above.**

- `scripts/storyblok/02-copy-exercise-content.mjs`: `GET` the flat `/activities` and `/grounding` stories, walk the `accordion` bloks embedded in their `page_sections[0].content` richtext (translations live as a full richtext-doc copy per locale on `content__i18n__<lang>`; items are matched across locales by `accordion_id`, not `_uid` — embedded-blok uids aren't stable across i18n copies), and `POST /stories` one per item into `activity/` (`resource_activity`) or `grounding-exercises/` (`resource_grounding`; renamed to `grounding/` in step 6) — **`slug` = the old accordion id verbatim, including the pre-existing `grouding-sound-of-claps` typo** (so `?openacc=<id>` and `?id=<id>` are the same string, no per-item redirect needed) — carrying `name`, `body`, and per-locale `name__i18n__<lang>` / `body__i18n__<lang>` for every locale that has both. `translated_slugs` is **not** set — the source pages carry none and the slug is locale-invariant, so there's nothing to carry. `languages` = `['default', ...locales translated]`; `included_for_partners` = `['Public']`; `resource_activity` also gets `login_required: true` (decision 1 — a deliberate gating change from today's public `/activities`, confirmed). Idempotent: skip a story that already exists (`--republish` to force-update one).
- **Done, as drafts**: all 16 grounding + 8 activity items created (24 total; one item, `activities-mapping-fear-and-stress-in-our-bodies`, has no `hi` translation upstream and was copied without it). None published — see the step-1 backend note above.
- Manifest `{ oldAccordionId, type, newSlug, newUuid, locales }` per item, plus full request payloads in dry-run mode — feeds steps 3 and 5. Latest: `.storyblok-provision/02-copy-exercise-content.*.json`.
- **Still to do, once the backend step-1 deploy is confirmed live**: `node scripts/storyblok/02-copy-exercise-content.mjs --publish --write --yes` (re-publishes every existing draft; throttled, watch backend logs + Rollbar). Grounding produces no `resource` row (expected). **Then verify** every `resource_activity` story got a `resource` row (query the backend / DB by `storyblokUuid`) and re-publish any misses — `resource-user` and feedback endpoints return **404, not create-on-demand**, if the row is absent.

## Step 3 — Copy `related_exercises` references (grounding only, for now)

**Done.**

- `scripts/storyblok/03-remap-related-exercises.mjs`: for every `resource_short_video` / `resource_single_video` / `resource_conversation` story with `related_exercises`, take the `grounding-*` ids → `related_grounding` (uuids from step 2's manifest); `PUT`, re-published (default; `--draft` to opt out). Idempotent — skips a story whose `related_grounding` already matches.
- Safe without the step-1 backend deploy: these are the pre-existing old-component stories, already recognised by the currently-deployed webhook; re-publishing only adds an inert field.
- Ran live: **5 of 27 stories** had a `grounding-*` reference and were updated + republished — `shorts/sex-after-trauma`, `shorts/what-is-assertiveness-`, `shorts/rigid-vs-relaxed-boundaries`, `shorts/fear`, `shorts/enthusiastic-consent` (all `resource_short_video`; no `resource_single_video` or `resource_conversation` story references grounding today). Verified live: `related_grounding` set to the correct uuid(s), `related_exercises` and every other field untouched, still published.
- **`activity-*` ids are not touched yet** — the live frontend's `related_content` renderer can't handle `resource_activity` refs until the step-6 deploy. They move into `related_content` in step 6's post-verify backfill.
- `related_exercises` left in place on every story (live frontend still reads it until the step-6 deploy).

## Step 4 — Point the frontend at `related_grounding`, drop `related_exercises` prop

**Done.** Landed on top of the `resource-pages-redesign` merge (#1944, `ee86895`) — the redesign's `ResourcePageLayout` / `ResourceGroundingSection` primitives referenced below didn't exist on `epic-redesign` until that merge; step 4 was blocked until it landed.

- `ResourceGroundingSection.tsx` — takes `groundingIds: string[]` (was `exerciseIds`); dropped the `grounding-`/`activity-` prefix split and `EXERCISE_CATEGORIES` import (the section only ever renders grounding now — `activity-*` ids move into `related_content` in step 6); each card links `/grounding?id=<slug>` (was `/${category}?openacc=<slug>`); the per-item badge label is now always `t('groundingLabel')`.
- `ResourcePageLayout.tsx` — renamed the `relatedExercises` prop to `relatedGrounding`, passed through as `groundingIds`.
- The three `StoryblokResource*Page.tsx` + `app/[locale]/{shorts,videos,conversations}/[slug]/page.tsx` — added `related_grounding` (`resolve_relations`'d to full story objects, mapped to leaf `.slug`s) to each; dropped `related_exercises` from props/destructuring/`storyblokEditable`. `resource_short_video` additionally dropped `related_session`/`related_course` entirely: the `Props` interface, the "this clip is from Session X" button + hero eyebrow, and their `resolve_relations` (`app/[locale]/shorts/[slug]/page.tsx` no longer does the secondary course/session fetch). `resource_single_video`'s dead `related_session`/`related_session.course` `resolve_relations` (that component never had the field) also dropped.
- `getNextResourceButtonLabel.ts` — already deleted by the redesign merge (the "next resource" button feature it supported was removed); nothing left to do here. Confirmed no dangling references.
- The `related_exercises` field itself is left untouched on every Storyblok story — only the frontend stopped reading it. `EXERCISE_CATEGORIES` in `lib/constants/enums.ts` is now unused but, per step 8, its removal is deferred.
- `yarn type-check && lint && test` — all green (185 tests, 21 suites).
- **Known pre-existing bug, not touched (per the Landmines section — fixed when the `video` route is built in step 7):** `shorts/[slug]/page.tsx`'s `generateStaticParams` filters `component: { in: 'resource_short' }`, which doesn't match the real component name `resource_short_video`.

## Step 5 — Redesign grounding + activity pages (and add written, audio routes)

- `lib/constants/enums.ts` / `events.ts` — add `RESOURCE_CATEGORIES.{AUDIO,WRITTEN,ACTIVITY}` and `RESOURCE_{AUDIO,WRITTEN,ACTIVITY}_*` + `RESOURCE_GROUNDING_VIEWED` (keep old constants until step 7).
- `libraryData.ts` — `FORMAT_BY_COMPONENT` += `resource_audio/written/activity`; `Format` stays 4-wide (no `grounding`).
- **Gating:** resource page reads `login_required`; when true + logged-out → preview + login overlay. Remove `video/audio/written/activity` from `AuthGuard.authenticatedPathHeads` and `libraryData.AUTHENTICATED_PATH_HEADS`; the library `requiresAccount` badge reads `login_required`.
- Routes:
  - `app/[locale]/{written,activity}/[slug]/page.tsx` — one shape: `getStoryblokStory('<type>/${slug}')`, `resolve_relations` for `related_content` + `related_grounding`, `generateStaticParams` from `starts_with` + `published`, `titleParent` metadata. (`/audio` waits for 7a — no audio content until step 7.)
  - `app/[locale]/grounding/page.tsx` — fetch all `resource_grounding` stories (by component filter, **not** a folder path — the folder is still `grounding-exercises/` at this point); render cards; `?id=<slug>` **and** `?openacc=<id>` (same string — step 2 set `slug` = accordion id) open the overlay; fire `RESOURCE_GROUNDING_VIEWED`.
  - `app/[locale]/[slug]/page.tsx` `excludePaths` += `written`, `activity`, `grounding`.
- Page components `StoryblokResource{Audio,Written,Activity}Page.tsx` on the existing redesign primitives (`ResourceHero`, `ResourcePageLayout`, `ResourceActions`, `ResourceAudioPlayer`, `ResourceMediaCard`, `ResourceCompleteCard`, `ResourceFeedbackDialog`); written + activity wire into `resource-user` progress + feedback. (Written content is authored by the content team in `written/` any time after step 1; each publish creates its `resource` row via the step-1 webhook — spot-check the row exists before relying on progress.)
- `ResourceCarousel` / `StoryblokResourceCarousel` / `StoryblokRelatedContent` — add `resource_audio` / `resource_written` / `resource_activity` cases (their `default` silently drops the card); `included_for_partners` filter applies to all types.
- `ResourceCard` / `RelatedContentCard` — unify the i18n key (`relatedContent.${category}`); replace `/bloom_shorts.png` with a type-neutral default, fix the alt + drop the TODO.
- `getLibraryStories.ts` — add `written/`, `activity/`, `audio/` queries (or collapse to one flat `resources` array — recommended); update `useLibraryItems.ts` and the `StoryblokCoursePage` `libraryStories` literal.
- Redirects (`next.config.js`, bare + `/${LOCALE_PATTERN}/`, permanent) — all targets already exist when this deploys: `/activities` → filtered library view; `/activities?openacc=activity-x` → `/activity/activity-x` (folder-swap only — slug is the id); `/grounding` stays `/grounding` (the new route reads `?openacc`/`?id` itself).
- i18n (8 locales): `Resources` += `written`, `activity`, `nextWrittenButtonLabel`, `nextActivityButtonLabel`, `relatedContent.resource_written/_activity`, grounding strings; verify `Library.contentTypes.written/.activity` (`ar`/`tr` per `translation-register-ar-tr`); `node scripts/checkTranslation.js`.
- Tests: unit + `cypress/.../{written,activity,grounding}.cy.tsx`. `yarn cypress:headless`.
- **Does not** delete the flat Storyblok pages or touch old routes — that waits for step 6's post-verify.

## Step 6 — Deploy progress

- Merge steps 4–5 to `develop` → staging → run the verification checklist for written / activity / grounding → `develop` → `main`.
- **Post-verify, only after production is confirmed green:**
  - `scripts/storyblok/03b-activities-to-related-content.ts` — append the `activity-*` refs from `related_exercises` into `related_content` (the deployed frontend now renders them); re-publish.
  - `scripts/storyblok/04-delete-flat-pages.ts` — `DELETE /stories/:id` for the flat `grounding` + `activities` stories (now shadowed by the new route + redirect), then `PUT /stories/:id` to rename the `grounding-exercises/` folder slug → `grounding/` (uuid-stable; `related_grounding` refs unaffected). If `getLibraryStories.ts` / the grounding route switch to `starts_with: 'grounding/'`, that frontend change ships in the same deploy as the rename.
- Confirm again in production, then start step 7.

## Step 7 — Move conversations + shorts (+ somatic videos) into audio / video

Ordered so no URL ever 404s: the new routes resolve the old folder path too, and the old routes 301 away, **before** any story moves.

**Pre-flight (before writing 7a):** `scripts/storyblok/05a-collision-scan.ts` — list leaf slugs across `shorts/` + `videos/` (both merge into `video/`). Any leaf that appears in both, or already exists in `video/`, is a `full_slug` collision — Storyblok rejects the duplicate on move. Content team renames the loser **in its current folder** now; those specific old→new redirects go into 7a. After this, 7c changes only the folder segment, never the leaf.

### 7a — Frontend: merged components + dual-path routes + redirects (deploy first)

- `enums.ts` — drop `SHORT_VIDEO/SINGLE_VIDEO/CONVERSATION`, `STORYBLOK_TAGS.SOMATICS` usage. `events.ts` — `RESOURCE_SHORT_VIDEO_*` + `RESOURCE_SINGLE_VIDEO_*` → `RESOURCE_VIDEO_*`; `RESOURCE_CONVERSATION_*` → `RESOURCE_AUDIO_*`; drop the stale non-`_AUDIO_` conversation constants; add an old→new comment map.
- Merge `StoryblokResourceShortPage` + `StoryblokResourceSingleVideoPage` → `StoryblokResourceVideoPage` (`EVENT_PREFIX = 'RESOURCE_VIDEO'`); rename `StoryblokResourceConversationPage` → `StoryblokResourceAudioPage`. Fix the `eventPrefix` passed to `<Video>`/`<Audio>` so it equals `EVENT_PREFIX` (today the short page passes `"RESOURCE_SHORT"`) → clean `RESOURCE_VIDEO_VIDEO_STARTED` / `RESOURCE_AUDIO_AUDIO_STARTED`.
- **`ResourceCarousel.tsx` + `StoryblokResourceCarousel.tsx` + `StoryblokRelatedContent.tsx`** — add `resource_video` / `resource_audio` cases **and keep** `resource_short_video` / `resource_single_video` / `resource_conversation` (their `default`/fallthrough silently drops a card, so an untaught component = missing cards on course/session/welcome carousels once 7c runs). Old cases removed in 7d.
- `app/[locale]/video/[slug]/page.tsx` + `audio/[slug]/page.tsx` from the merged pages. **Transitional fetch:** try `video/${slug}` (resp. `audio/${slug}`), on miss fall back to `shorts/${slug}` ‖ `videos/${slug}` (resp. `conversations/${slug}`). Pass **both** old and new keys in `resolve_relations` (`resource_video.related_content` _and_ `resource_short_video.related_content`, …) so related content resolves whichever component the story still has. `dynamicParams = true` (back to `false` in 7d); `generateStaticParams` from `starts_with: 'video/'|'audio/'` + `published`, not the (silently-ignored) component filter.
- `next.config.js` redirects (permanent, bare + `/${LOCALE_PATTERN}/`): the per-slug renames from the collision scan **first**, then `/shorts/:slug` + `/videos/:slug` → `/video/:slug`; `/conversations/:slug` → `/audio/:slug`. Delete `app/[locale]/{shorts,videos,conversations}/`. `[slug]/page.tsx` `excludePaths`: swap the three old segments for `video`, `audio`.
- `getLibraryStories.ts` — query `video/` + `audio/` **and** still `shorts/` `videos/` `conversations/` (union, dedup by uuid) until 7d; drop `with_tag: SOMATICS`. `FORMAT_BY_COMPONENT` — add `resource_video`/`resource_audio`, keep the old keys until 7d.
- i18n — `shorts`→`video`, `conversations`→`audio`, `nextConversationButtonLabel`→`nextAudioButtonLabel`, `relatedContent.resource_video`/`resource_audio` added (old keys kept until 7d), `conversationTranscriptLink`→`audioTranscriptLink`.
- Tests: merge `shorts.cy` + `videos.cy` → `video.cy`; `conversations.cy` → `audio.cy`; fix `library.cy` (drop `somatics`), `libraryData.test`, `useLibraryItems.test`.
- Deploy → staging → verify old URLs 301 to new routes and render (via the fallback fetch) → `main`.

### 7b — Backend migration (deploy after 7a)

One migration (values + PG enum — `resource_themes_enum` in `1783516811780` is the enum precedent, though it added a fresh column; this is an in-place `ALTER COLUMN TYPE`, new to this repo):

```
-- guard: abort if any value is outside the expected set
DO $$ BEGIN IF EXISTS (SELECT 1 FROM "resource" WHERE "category" NOT IN
  ('short_video','single_video','conversation','video','audio','written','activity'))
  THEN RAISE EXCEPTION 'unexpected resource.category value'; END IF; END $$;
UPDATE "resource" SET "category" = 'video' WHERE "category" IN ('short_video','single_video');
UPDATE "resource" SET "category" = 'audio'  WHERE "category" = 'conversation';
CREATE TYPE "public"."resource_category_enum" AS ENUM('video','audio','written','activity');
ALTER TABLE "resource" ALTER COLUMN "category" TYPE "public"."resource_category_enum"
  USING "category"::text::"public"."resource_category_enum";
```

- Reporting-only column — no user-facing effect. `down()` is lossy (`video → single_video`, `audio → conversation`) — acceptable.
- Entity → `@Column({ type: 'enum', enum: RESOURCE_CATEGORIES })`; trim old `RESOURCE_CATEGORIES` members so the TS enum matches the PG type.
- Keep old event names in `reporting.events.ts` for the transition window.
- Trade-off: a PG enum makes later value changes cost the create-new-type/swap/drop dance; if the set won't be stable, use `CHECK ("category" IN (…))` instead.

### 7c — Storyblok: move content (run after 7a + 7b are in production)

- `scripts/storyblok/05-move-content.ts` (`--dry-run` first; idempotent — skip a story already in the target folder): `PUT /stories/:id` to set `parent_id` → `video/` + `content.component = 'resource_video'` for `shorts/*` + `videos/*` (`login_required=false` on every short and any public somatic video, in the same `PUT`); `parent_id` → `audio/` + `resource_audio` for `conversations/*`. **`slug` unchanged** (collisions were resolved pre-7a); **uuid is stable**; carry `translated_slugs`. Emit `{ uuid, locale, oldFullSlug, newFullSlug }` manifest.
- Asserts `related_content` / `related_grounding` / `resource_carousel.resources` are uuid refs; logs any raw-slug refs to fix.
- After each batch, re-publish is picked up by the step-1 webhook → `resource` row's `slug` + `category` updated on the spot. Spot-check a few rows.
- Editorial freeze announced; publish in throttled batches; watch logs + Rollbar. Each moved story: new URL already resolves, old URL already 301s → new URL → served via the 7a fallback until the ISR cache refreshes.

### 7d — Frontend: drop the transition scaffolding (deploy after 7c is verified)

- Remove the old-folder fallback fetch and the old `resolve_relations` keys; `dynamicParams = false` + real `generateStaticParams`.
- `ResourceCarousel` / `StoryblokResourceCarousel` / `StoryblokRelatedContent` — drop the old-component cases. i18n — drop old `relatedContent.*` keys.
- `getLibraryStories.ts` — drop the `shorts/` `videos/` `conversations/` queries; `FORMAT_BY_COMPONENT` — remove old keys.
- Confirm from the 7c manifest that every `oldFullSlug`→`newFullSlug` differs only in the folder segment (it should — collisions were pre-resolved); the 7a folder redirects then cover everything.
- Regenerate `public/sitemap.xml` (new URLs only).
- Deploy → staging → verify → `main`.

## Step 8 — Remove old folders, entity types, and references

- **After the GA transition window + production verification.**
- **bloom-frontend:** delete old i18n keys, the old→new event comment, `EXERCISE_CATEGORIES` if unused, `STORYBLOK_TAGS.SOMATICS`, `bloom_shorts.png`.
- **bloom-backend:** remove old `RESOURCE_CATEGORIES` / `STORYBLOK_PAGE_COMPONENTS` members, old event names in `reporting.events.ts`, old `RESOURCE_CATEGORY_LABELS` keys.
- **Storyblok** — `scripts/storyblok/06-cleanup.ts`: `DELETE /components/:id` for `resource_short_video` / `resource_single_video` / `resource_conversation`; `DELETE /stories/:id` for the empty `shorts/` `conversations/` `videos/` folders; `PUT /components/:id` to drop the `related_exercises` field from any block still declaring it.
- **GA4 / Looker Studio:** repoint explorations, audiences, dashboards, and the backend Slack report to the new event names + category values; register the new events as key events; annotate the cutover date.

---

## Landmines

- **`login_required` default true hides today's public shorts** — the 7c move script sets `false` on every short (and any public somatic video) in the same `PUT` that moves it, so gating never regresses. Per-story gating means the page component (not `AuthGuard`) renders the overlay.
- **`category` was insert-only** — fixed in step 1; without it, moved/re-published stories keep a stale category.
- **`resource_short` vs `resource_short_video`** — `shorts` `generateStaticParams` filters the wrong string; fix when building the `video` route.
- **`eventPrefix` double-word** — `RESOURCE_SINGLE_VIDEO` + `Video.tsx` → `RESOURCE_SINGLE_VIDEO_VIDEO_STARTED`; settle the convention in step 7 and match `reporting.events.ts`.
- **enum value drift** — frontend `CONVERSATION='resource_conversation'` vs backend `'conversation'` vs GA `resource_conversation`; unify to `audio`.
- **`full_slug` collisions on the video merge** — if a leaf slug exists in both `shorts/` and `videos/`, the move `PUT` is rejected. Pre-flight scan + rename-in-place before 7a (step 7 pre-flight).
- **`resource-user` / feedback are not create-on-demand** — they 404 if no `resource` row exists for the `storyblokUuid`. Every new `resource_activity` / `resource_written` story must be confirmed to have produced a row (webhook) before it's linked anywhere users can complete it.
- **`ResourceCarousel` / `StoryblokRelatedContent` fail silently** — an untaught `component` renders no card (empty carousel → `<div/>`). 7a must teach the new components while keeping the old.
- **`dynamicParams = false` + ISR on resource pages** — a moved story's old path hard-404s once its cache refreshes. Step 7a's dual-path fetch + 301s (deployed before any move) close the gap; `dynamicParams` only goes back to `false` in 7d.
- **no sitemap generator in the repo** — `public/sitemap.xml` is hand/externally maintained; regenerate it from the 7c manifest (or find the real process) in step 7d.
- **Storyblok script safety** — every script is `--dry-run`-first, throttled ≤3 req/s, and writes a manifest; a bad `PUT` to a component `schema` can corrupt every story of that type, so diff the schema payload before the live run.
- **`ar`/`tr` key parity** — `checkTranslation.js` fails on drift even where values stay English.
- **partner welcome pages** embed `resource_carousel` with hand-picked refs — re-verify resolution after every folder move (uuid refs should survive).
- **GA4 can't rename history** — renamed events split every series; Looker/dashboards recover only by repointing.

## Verification (staging, then production)

- Publishing a resource upserts the `resource` row with the right `category`; grounding produces none.
- `resource-user` start/complete still records for migrated stories.
- Library `Content type` filter shows Video / Audio / Written / Activity; grounding absent.
- `login_required` true → overlay when logged-out; false → full render; public shorts render full.
- `/grounding?id=<slug>` opens the right overlay; old `?openacc=` links resolve.
- Old URLs 301 to new — spot-check every locale.
- `sitemap.xml` lists new URLs only.
- Related-content + grounding carousels on course/session/welcome pages resolve.
- GA4 DebugView shows the new events with the new `resource_category`.
- Weekly Slack report renders the resource breakdown with new labels.

## Rollback

| Layer                     | Rollback                                                                                                                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| bloom-backend             | Revert PR — webhook still understands old components (kept until step 8). Migration `down()` lossy but safe.                                                                                     |
| Storyblok steps 2–3       | New stories are additive — unpublish/delete. Flat pages untouched until step 6's post-verify.                                                                                                    |
| bloom-frontend steps 4–6  | Revert PR — new folders hold no old content, no 404 risk for existing URLs.                                                                                                                      |
| Storyblok step 7c         | `05-move-content.ts --reverse` off the manifest (restore `parent_id` + `component`); uuids preserved → backend re-syncs on publish. 7a is still deployed, so old URLs keep resolving throughout. |
| bloom-frontend step 7a/7d | Revert PR — 7a's fallback fetch means the old routes still resolve whether or not content moved; 7d revert restores the fallback.                                                                |
| Redirects                 | Remove from `next.config.js`.                                                                                                                                                                    |
| GA4                       | No rollback for split history; repoint filters.                                                                                                                                                  |
