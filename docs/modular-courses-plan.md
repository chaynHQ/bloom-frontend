# Modular courses: plan

Courses will be built from the library's existing video, audio and written pieces, and one piece can sit in several courses without being copied.

- **Step A** launches the new Turkish and Arabic courses. It includes course progress in the database, reporting, Mailchimp and the support inbox (Front). Existing courses are left untouched.
- **Step B - future as needed** later moves the existing courses onto the same model, so every course works one way.

Nothing built in Step A is thrown away in Step B, apart from one temporary fallback for the old course format.

- [Part 1: Product overview](#part-1-product-overview)
- [Part 2: Technical implementation](#part-2-technical-implementation)

---

## Part 1: Product overview

### Why

- Today every course session is a video built for exactly one course.
- The new Turkish and Arabic courses need sessions that are video, audio or written, each with an optional activity and bonus content.
- The same piece should appear in several courses, and in the library, without being duplicated.

### The rules members will see

These apply to the new courses from Step A, and to every course from Step B.

| What                   | Rule                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Piece tick             | A piece done anywhere is ticked everywhere: in the library, in every course that includes it, and on its own page  |
| Course **in progress** | The member has done something _inside this course_. Pieces done from the library or another course don't start it. |
| Course **completed**   | Every piece in the course (in the member's language version) is done, wherever it was done                         |
| Library                | Each piece is listed once, with a "Part of {course}" or "Part of {n} courses" label                                |

Example: a member listened to 3 of a course's 5 pieces from the library. When they open the course, those 3 are ticked and the course isn't started yet. Once they play a piece inside the course, it shows "in progress". It completes when the last 2 are done, wherever they do them.

### Step A: what members get

- **New Turkish and Arabic courses** made of video, audio and written pieces, each with an optional activity and bonus content.
- **A course experience.** A piece opened from a course shows inside the course layout: the playlist alongside, "Back to course", and "Next: {piece}".
- **Ticks everywhere,** plus the "in progress" and "completed" badges on courses, following the rules above.
- **A tidy library:** one card per piece, with a "Part of …" label. Each piece's own page links to the courses it belongs to.
- **Existing courses are unchanged.**

### Step B: what it adds

- Existing courses move to the same single list of sessions, and their sessions can be reused in other courses.
- The Mailchimp and support-inbox (Front) course fields also list each piece's progress for the new courses. In Step A they hold only the course's status.

### Content team guide

1. **Create each piece once,** in the `video/`, `audio/` or `written/` folder. Add its activity and bonus content there; it then shows wherever the piece appears.
2. **Create the course in its own folder** under `courses/`. Put **no other stories in that folder.**
3. **Pick the pieces, in order,** into the course's new **Sessions** field. Until Step B, only video, audio and written pieces can be picked.
4. **Give the course an English working name** in the default (English) slot, even when the course isn't offered in English. Our Mailchimp field names are built from the name's initials.
   - The initials must not match an existing course. Already taken: **CB, MA, IARO, RTAR, RRYTS, SPST, HST, DBR.**
   - Matching initials would overwrite another course's Mailchimp field. Arabic or Turkish text here would likely break the field name.
5. **Set the course's Languages** (for example `tr`, `ar`). Each piece's Languages must include the same ones.
6. **Keep access settings consistent.** A piece's own "login required" and partner settings also apply inside a course.
7. **Publish the pieces before the course,** and don't add pieces to a course after launch unless intended. Members who finished it would lose the completed badge on the site until they finish the new piece. Their recorded completion stays.

### Reporting and emails

|                                           | Step A                                                                       | Step B                      |
| ----------------------------------------- | ---------------------------------------------------------------------------- | --------------------------- |
| Session and resource counts               | Unchanged. Pieces in new courses count as resources.                         | Unchanged                   |
| Courses started and completed (reporting) | New courses included, following the rules above. Existing courses unchanged. | Same rules for every course |
| Mailchimp and Front course status field   | Set for new courses a member has started                                     | Every course                |
| Mailchimp and Front course sessions field | Empty for new courses                                                        | Filled for every course     |
| Google Analytics                          | Course events tagged with the course                                         | Same                        |

A course whose pieces were all done elsewhere, without the member ever starting it inside the course, shows "completed" on the site. It isn't counted as started or completed in reporting or Mailchimp, because the member never took the course itself.

### Decisions needed

1. **Confirm the rule above** for courses whose pieces were all done elsewhere (recommended as written).
2. **Before Step A launches:** do any Mailchimp emails or automations need to react to the new courses?
3. **Before Step B:** does anyone run reports straight from the database, outside our usual reporting?
4. **Now, separate from this plan:** the Hindi version of _Dating, boundaries and relationships_ lists a first session that isn't published. Hindi members see 7 of 8 sessions and can't complete the course. That session needs publishing or replacing.

### Estimated effort

- **Step A:** about 1.5 weeks of frontend and 3 days of backend, in parallel, plus QA. Roughly 2 weeks in total.
- **Step B:** about 1.5 to 2 weeks, plus its data safety checks.

---

## Part 2: Technical implementation

### How courses work today

Verified on 2026-10-26 against Storyblok, and against bloom-backend `develop` and `main`.

**Storyblok**

- `Course.weeks` is a list of `week` blocks. `week.sessions` is a translatable story picker filtered to `Session`, `session_granular` and `session_iba`. `session_granular` no longer exists, and nothing uses it.
- `Session` and `session_iba` each have a required, single `course` relation, and live at `courses/<course>/<session>`.
- `resource_video`, `resource_audio` and `resource_written` have no `activity` or `bonus` fields. They have a single `related_session`.
- Week names are never rendered. `weeks` is only flattened into a list (`lib/utils/courseSessions.ts`), counted (`lib/utils/libraryData.ts`), and read for the free first session (`lib/hooks/useLibraryItems.ts`).
- The space has 8 courses, 48 `Session` stories and 10 `session_iba` stories. Session lists are the same in every locale except Hindi on `dating-boundaries-and-relationships`.
- All 32 `import-tr-ar-2026` pieces are published.
- Storyblok is one space shared by staging (reads `draft`) and production (reads `published`).

**Backend**

- The Storyblok webhook (`src/webhooks/webhooks.service.ts`, `updateOrCreateStoryData`) fetches the published default-language story and syncs one of three things:
  - **Courses:** `course` rows (name, slug, status, themes) and `course_partner`. For a new course it creates the Mailchimp merge fields `C_<initials>` and `C_<initials>_S`, from `getAcronym(name)`. It never reads `weeks`.
  - **Sessions:** `session` rows, with `courseId` taken from the session's `course` field.
  - **Resources:** `resource` rows for video, audio, written, activity and grounding, with `category` taken from the component. Present on `develop` and `main`.
- **Session progress:**
  - A `session_user` row sits under a `course_user` row, unique on (`courseUserId`, `sessionId`).
  - Session start and complete find the session and use its single `courseId`.
  - Completion is `completed session_user` = `published sessions with that courseId` (`checkCourseIsComplete`).
  - `setCourseUserCompleted(false)` clears `completedAt`.
- **Resource progress:**
  - A `resource_user` row (`userId`, `resourceId`, `completedAt`). It has **no unique constraint** and no course link.
  - `setResourceUserCompleted` creates the row **without `completedAt`** when no row exists yet. That's a bug: the completion is lost.
- **Reporting** (`src/reporting/db-metrics.service.ts`) counts `course_user`, `session_user` and `resource_user` rows by their `createdAt` and `completedAt` ranges.
- **Mailchimp and Front course fields** (`serializeCourseData`) come from `course_user.completed` and `sessionUser`. They're sent by `updateServiceUserProfilesCourse`. Front's custom-field PATCH sends the full set and throws on failure.
- The global `ValidationPipe` uses `whitelist: true` without `forbidNonWhitelisted`, so unknown body fields are silently dropped, not rejected.
- No "course started" or "course completed" analytics events exist on the frontend or backend.

**Frontend**

- **Course route** `app/[locale]/courses/[slug]/page.tsx`:
  - Fetches the course with `resolve_relations: 'week.sessions'`. Static params come from `cdn/links`, with `dynamicParams = false`.
  - `StoryblokCoursePage` takes course progress from the `courses` slice, which is filled by `getUser` and `getUserCourses`. It has no language gate.
- **Session route** `app/[locale]/courses/[slug]/[sessionSlug]/page.tsx` fetches by physical path `courses/<slug>/<sessionSlug>`.
- **Resource pages** (`components/storyblok/StoryblokResource*Page.tsx`) render through `ResourcePageLayout`, via `useStoryblokResourcePage`:
  - Gating order: language, then partner, then login.
  - Progress goes through `useResourceProgress` to the `resources` slice. Its `start` returns early unless the resource is `NOT_STARTED`.
  - Only `completeSession` invalidates the `UserCourses` tag.
- **Library:** courses, plus `courseSessions` (`Session` and `session_iba` under `courses/`, labelled via `parentCourseSlug`), plus resources. A resource that's also in a course is already listed once.
- **Slug collision:** `video/what-are-boundaries` and `audio/what-are-boundaries` both exist, so course URLs for resources must include the folder.
- **`getStoryblokStory`:** its `uuids` argument is broken (it requests `cdn/stories/false`). Fetching by uuid works with `find_by: 'uuid'`.
- **Canonical:** every page inherits `alternates.canonical` = the locale home page from `generateMetadataBase`.

---

### Step A

Covers the new-format courses only: courses that use the new `sessions` field. Courses on `weeks` keep every existing code path.

#### A1. Storyblok schema (additive)

| Component                                              | Change                                                                                                                                                                     |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Course`                                               | Add `sessions`: `options`, source `internal_stories`, `filter_content_type` = `resource_video`, `resource_audio`, `resource_written`, translatable (as `week.sessions` is) |
| `resource_video`, `resource_audio`, `resource_written` | Add optional `activity` (`richtext`, same whitelist as `Session.activity`) and optional `bonus` (`bloks`, whitelist `bonus_block`)                                         |
| `week`                                                 | Remove the stale `session_granular` from `sessions.filter_content_type`                                                                                                    |

- The field is named `sessions` because Step B widens it to `Session` and `session_iba` too.
- Every change is a new optional field, so existing stories are unaffected.

#### A2. Backend: course item lists

1. **Migration:** add a nullable `items` jsonb column to `course`, shaped `{ [language]: storyblokUuid[] }`. Its down-migration drops the column. No existing rows change.
2. **Webhook, course branch:**
   - Only when `content.sessions` is an array, fetch the published course once per language: `default` plus each entry in `content.languages`. Store the raw uuid list for each.
   - If any fetch fails, fail the sync, so no partial lists are saved.
   - Courses without `sessions` keep `items = null`.
3. **`items IS NOT NULL` is the only test for "new-format course"** anywhere in the backend.

#### A3. Backend: course context and completion

1. **DTO:** add an optional `courseStoryblokUuid` to `ResourceUserDto` (`@SecureInput('text', { maxLength: 100 })`, optional). It applies to `POST /resource-user`, `/complete` and `/incomplete`.
2. **Fix the completion bug:** `setResourceUserCompleted` sets `completedAt` when it has to create the row.
3. **Start with a course** (`POST /resource-user` + `courseStoryblokUuid`):
   - Check the course row exists, has `items`, and some language list contains this resource uuid.
   - If so, find or create `course_user` (`completed: false`), then run the completion check for that course.
   - Otherwise do nothing extra.
   - The resource start itself is unchanged: it's idempotent, and returns any existing row untouched.
4. **Completion check, after any resource completion** (with or without a course):
   - For each `course_user` of this member that isn't completed, whose course has `items` containing this resource:
     - For each language list, take its items. A uuid whose `resource` row is unpublished is ignored, matching the frontend, which hides unpublished items.
     - A uuid with **no `resource` row at all fails closed**: that list can't complete, and the check logs a warning.
     - The course is complete when some list has at least one item, and every counted item has **any** `resource_user` row for this member with `completedAt` set. Look for "any" row because `resource_user` can have duplicates.
   - **One-way:** set `completed = true` and `completedAt = now()` only on a false-to-true change. Never clear either.
   - `/incomplete` never un-completes a course.
5. **Updates:** after creating a `course_user`, or completing one, call the existing `updateServiceUserProfilesCourse`. This sets Mailchimp and Front `C_<initials>`. `C_<initials>_S` stays empty because these courses have no `sessionUser` rows.
6. **Non-blocking:** wrap all course logic in try/catch and log failures. A resource progress response must never fail because of course logic.
7. **Untouched:** session endpoints, `checkCourseIsComplete`, the courses response format, and reporting queries. New `course_user` rows come back through the existing `/courses-user` with `sessions: []`.

#### A4. Frontend: course item model

**`lib/utils/courseSessions.ts`:**

- `getCourseSessions` reads `content.sessions` when it's a non-empty array, and otherwise falls back to the flattened `weeks`. The fallback is removed in B3.
- Extend `CourseSession`:
  - `format: 'video' | 'audio' | 'written'` (replaces `hasVideo`);
  - `kind: 'session' | 'resource'`;
  - `loginRequired?: boolean`.
- Resource items:
  - `description` = `toPlainText(content.description)`. Resource descriptions are rich text, and rendering them as a string would crash the card.
  - `minutes` = `parseMinutes(content.duration)`.
  - `href` = `/courses/<course>/<folder>/<slug>`, locale-aware.
- Unresolved relations are dropped, as today.

**Elsewhere:**

- **Course route:** add `'Course.sessions'` to `resolve_relations`. Storyblok caps how many relations it resolves per request, so check its current documented limit. New courses should be far below it.
- **Library data:** `toLibraryStory` and `LibraryStory` carry `sessions`. `storyToLibraryItem` counts `sessions` before `weeks`.
- **Card UI:** `CourseSessionCard` and `SessionPlaylist` render a `FormatBadge` from `format`.

#### A5. Frontend: progress and course status

- **`useItemProgress()`:** a `Record<storyblokUuid, 'started' | 'completed'>` merged from the `resources` slice and every course's `sessions` in the `courses` slice. Used for ticks everywhere.
- **Course status:**
  - In progress: from that course's own entry in the `courses` slice (`determineCourseProgress`), for every course type.
  - Completed for a new-format course: the backend says completed, **or** the course has at least one resolved item and every resolved item is completed in `useItemProgress()`. This is display only, and covers pieces all done elsewhere.
  - The library course cards and "Other courses" use the same function.
- **Hero CTA:** "Continue course" when the course is started or any item has progress, otherwise "Begin course". `ctaHref` is the first unfinished item.
- **`useResourceProgress`:**
  - Takes an optional `courseStoryblokUuid`.
  - Inside a course, `start` also runs when the item is already started or completed but the course isn't started. That's how a member who did every piece elsewhere still starts the course.
  - Both calls include `courseStoryblokUuid`.
- **`lib/api.ts`:**
  - `startResource` invalidates `UserCourses` when `courseStoryblokUuid` is set.
  - `completeResource` always invalidates it, because completing from the library can complete a course that's already started.
- **Feature flag:** `NEXT_PUBLIC_FF_COURSE_PROGRESS` (`FeatureFlag.isCourseProgressEnabled`) controls sending `courseStoryblokUuid`. It's a build-time env var, so turning it off needs a frontend redeploy but no code revert or backend change. Progress then goes back to pieces only.

#### A6. Frontend: course item route

New route `app/[locale]/courses/[slug]/[sessionSlug]/[itemSlug]/page.tsx`. Here `sessionSlug` holds the resource folder (`video`, `audio` or `written`), so the URL is `/courses/<course>/<folder>/<slug>`.

- It doesn't overlap old session URLs, which have two segments.
- It avoids the existing slug collision.

**`generateStaticParams`:**

1. For each locale, fetch new-format courses with `getCourseStories(locale)`.
2. Collect the `sessions` uuids.
3. Map uuid to `full_slug` using `cdn/links` for the three folders.
4. Emit `{ locale, slug, sessionSlug: folder, itemSlug }`.

Include drafts when `STORYBLOK_ENVIRONMENT === 'draft'`, as `resourceFolderStaticParams` does.

**Page:**

- Fetch the course with `resolve_relations: 'Course.sessions'`, and the resource by path `<folder>/<itemSlug>` with the relations its own route resolves.
- `notFound()` if the resource isn't in that locale's list.
- Render the resource page component with `courseContext` (A7).

**Metadata:** title from the resource, and `alternates.canonical` = the resource's own URL.

**Links:**

- Course cards, the playlist and "Next" link here.
- Library cards and search keep linking to the resource's own page, which is standalone, with no course context.

#### A7. Frontend: course layout on resource pages

- **`courseContext`:** an optional prop, threaded from `StoryblokResourceVideoPage`, `StoryblokResourceAudioPage` and `StoryblokTextResourcePage` into `ResourcePageLayout` and `useStoryblokResourcePage`:
  ```ts
  courseContext?: {
    courseName: string;
    courseHref: string;
    courseUuid: string;
    items: CourseSession[];
    nextItem?: CourseSession;
  }
  ```
- **When it's set:**
  - Use `sessionContainerStyle` with `SessionCourseNav`.
  - The back link goes to the course (`Courses.backToCourse`).
  - Show "Next: {name}" beside the complete action.
  - Pass `courseUuid` to `useResourceProgress`.
  - Add `course_name`, `course_storyblok_uuid` and `course_item_position` to `eventData`.
- **Playlist locks:** today the rule is `accountNeeded && uuid !== previewSessionUuid`. Resource items should lock by their own `loginRequired` instead. Add an optional `isLocked(session)` prop to `SessionPlaylist` and `SessionCourseNav`, with today's rule as the default.
- **Gating order:**
  1. Course partner access: `hasAccessToPage` with the course's `included_for_partners`.
  2. The resource's own language, partner and login gating, unchanged.
- Without `courseContext`, resource pages render exactly as today.

#### A8. Frontend: library and resource pages

- **"Part of" labels:**
  - Build a map from item uuid to the titles of the visible courses that list it. A course is visible when it passes the locale and partner filter and isn't `coming_soon`.
  - One course: `Library.partOfCourse`. Several: a new key, `Library.partOfCourses` ("Part of {count} courses").
  - Old sessions keep `parentCourseSlug` labels until B3.
- **Activity and bonus:** if set, render them in `ResourcePageLayout`'s `beforeSections` slot:
  - activity: `SessionContentCard` with `format="activity"`;
  - bonus: `MultipleBonusContent`.
  - They show on standalone pages and inside course context alike.
- **"Part of: {Course A} · {Course B}":** links to each course overview, under the content card, using the same map. Hidden when there are none.
- **Language gate:** `ContentUnavailable reason="language"` on new-format course pages when `storyAvailableInLocale(course.languages, locale)` is false. Old courses keep today's behaviour; three of them are English-only, so gating them is a separate decision.
- **Translations:** add every new key to all 8 locales, then run `node scripts/checkTranslation.js`.

#### A9. Tests, QA and rollout

**Backend unit tests:**

- The webhook stores `items` per language, and leaves `null` for `weeks` courses.
- Start with a course: creates `course_user` only when the item is listed, and is idempotent.
- Completion:
  - completes across languages;
  - ignores unpublished items;
  - fails closed on missing resource rows;
  - handles duplicate `resource_user` rows;
  - is one-way;
  - is never triggered for courses without `items`.
- `/incomplete` leaves the course completed.
- The completion bug fix.
- Course logic errors don't fail the resource response.
- `updateServiceUserProfilesCourse` is called on create and on complete.

**Frontend unit tests:**

- `getCourseSessions` for both shapes.
- `useItemProgress`.
- Course status and CTA.
- Library labels for 0, 1 and 2 courses.
- Static params, including the collision.
- Playlist locks.
- `useResourceProgress` in course context.

**QA:**

- Staging reads draft content, but the backend only knows published courses. So QA needs a **published test course limited to a test partner**.
- Before publishing it, confirm which backends the Storyblok webhook calls, because a production webhook would create real Mailchimp fields. Give the test course initials that don't collide, and remove its fields afterwards.
- Run through:
  - signed out, signed in, and partner user;
  - `en`, `tr` and `ar` (right to left);
  - the mobile playlist;
  - ticks shared across two courses and the library;
  - "in progress" only after activity inside the course;
  - completion from the library after starting inside the course;
  - all pieces done elsewhere, then opening the course;
  - every existing course renders exactly as on production.

**Rollout order:**

1. A1 schema changes.
2. Backend PR, through staging to production. The backend ignores the new field until the frontend sends it.
3. Frontend PR, through `develop` (staging) to `main`, with the flag on.
4. The content team publishes the pieces, then the courses, after step 2. A course published earlier has `items = null` and must be republished.
5. Check that every piece in a new course has a `resource` row:
   ```sql
   SELECT "storyblokUuid", status FROM resource WHERE "storyblokUuid" IN (...);
   ```

**Rollback:**

- Turn the flag off: progress goes back to pieces only, and the course layout still works.
- Or revert the frontend. The `items` column and any new `course_user` rows are harmless if left.

#### Step A risks

| Risk                                               | Mitigation                                                                                                                                       |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Existing courses regress                           | Every new backend path requires `items`. Frontend `weeks` fallback, tests on current fixtures, and a staging comparison of every existing course |
| Wrong or early course completion                   | Verified on the server from `resource_user`. Fails closed on unknown pieces. One-way                                                             |
| Mailchimp field overwrite or failure               | Content rule 4 (unique Latin initials). Failures are logged only                                                                                 |
| Front rejects a new course field                   | Front's PATCH sends the full set and throws, so check with one test contact before launch                                                        |
| Test content reaching production                   | Test course limited to a test partner. Check webhook targets first                                                                               |
| Same content at several URLs                       | Canonical points to the resource's own URL                                                                                                       |
| New analytics parameters not visible in GA reports | Register them as custom definitions if needed                                                                                                    |

---

### Step B: one model for all courses

#### B1. Backend

1. **Item lists for old courses:** the webhook also stores `items` from flattened `weeks`, until B3.
2. **Session context:** an optional `courseStoryblokUuid` on the session-user DTOs, with the same rules as A3. Without it, sessions fall back to their home course, as today.
3. **One `session_user` per member and session:** before creating, look for an existing row for this member and session across their `course_user` rows. If several exist, use the oldest. Otherwise create it under the context course.
4. **One completion check** for sessions and resources, replacing `checkCourseIsComplete`. It's one-way. Courses still without `items` keep the old logic.
5. **Response:** `formatCourseUserObject` and `serializeCourseData` build `sessions` and `C_<initials>_S` from `items` plus progress.
6. **`resource_user` unique index** on (`userId`, `resourceId`), after a duplicate check and cleanup plan on production data.

#### B2. Frontend

- Send `courseStoryblokUuid` from old session pages too.
- Remove the new-format special cases, so one path serves every course.

#### B3. Content migration

1. A script using the Management API tooling in `scripts/` copies each course's flattened `weeks` into `sessions`, including per-language values (`sessions__i18n__hi`). It **skips any story with `unpublished_changes`**: today that's `creating-boundaries`.
2. Widen the `Course.sessions` picker to `Session` and `session_iba`.
3. Check every course and locale through the CDN: the new list equals the flattened old list.
4. Deploy, and let it run in production for a while.
5. Remove `weeks`, the `week` component and the frontend fallback.

**Open design point:** URLs for an old session reused in a different course. Either link to its home URL, or extend the A6 item route to old sessions.

#### B4. Safety checklist

1. Take a Render database backup.
2. Run read-only checks on a production snapshot:
   ```sql
   -- same user + session under more than one course_user
   SELECT cu."userId", su."sessionId", count(*) FROM session_user su
   JOIN course_user cu ON cu."courseUserId" = su."courseUserId"
   GROUP BY 1, 2 HAVING count(*) > 1;

   -- session_user rows under a course other than the session's current course
   SELECT count(*) FROM session_user su
   JOIN course_user cu ON cu."courseUserId" = su."courseUserId"
   JOIN session s ON s."sessionId" = su."sessionId"
   WHERE s."courseId" <> cu."courseId";

   -- duplicate resource_user rows (before the unique index)
   SELECT "userId", "resourceId", count(*) FROM resource_user
   GROUP BY 1, 2 HAVING count(*) > 1;
   ```
3. Produce a dry-run report on the snapshot: current vs recalculated completion for every `course_user`. Expect **zero un-completions**, and list each new completion.
4. Put the new session path behind a feature flag. Enable it on staging first.
5. Confirm which Mailchimp automations read `C_*` fields, and whether anyone queries the database directly.
6. No bulk backfill.

---

### Known issues found during this review

| Issue                                                                                                                              | Impact                                                                                     | Action                                       |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------- |
| Hindi `dating-boundaries-and-relationships` lists an unpublished first session (`courses/creating-boundaries/what-are-boundaries`) | Hindi members see 7 of 8 sessions; the backend expects 8, so the course can't be completed | Content decision now                         |
| `setResourceUserCompleted` creates rows without `completedAt`                                                                      | A completion sent before the start is saved as "started"                                   | Fixed in A3                                  |
| `resource_user` has no unique constraint                                                                                           | Duplicate rows are possible, which can inflate resources-started counts                    | Completion check tolerates them; index in B1 |
| Every page's canonical is the locale home page                                                                                     | SEO                                                                                        | Separate ticket                              |
| `getStoryblokStory`'s `uuids` argument requests `cdn/stories/false`                                                                | Latent; currently unused                                                                   | Remove, or use `find_by: 'uuid'`             |
| `week.sessions` lists the deleted `session_granular`                                                                               | None                                                                                       | Removed in A1                                |
| Mailchimp field names come from course-name initials                                                                               | New courses can collide with or overwrite existing fields                                  | Content rule 4                               |
