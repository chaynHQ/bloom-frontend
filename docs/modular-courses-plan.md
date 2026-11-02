# Modular courses: plan

Courses will be built from the library's existing video, audio and written resources, and one resource can sit in several courses without being copied.

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
- The same resource should appear in several courses, and in the library, without being duplicated.

### The rules members will see

These apply to the new courses from Step A, and to every course from Step B.

| What                   | Rule                                                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Resource tick          | A resource done anywhere is ticked everywhere: in the library, in every course that includes it, and on its own page  |
| Course **in progress** | The member has done something _inside this course_. Resources done from the library or another course don't start it. |
| Course **completed**   | Every resource in the course (in the member's language version) is done, wherever it was done                         |
| Library                | Each resource is listed once, with a "Part of {course}" or "Part of {n} courses" label                                |

Example: a member listened to 3 of a course's 5 resources from the library. When they open the course, those 3 are ticked and the course isn't started yet. Once they play a resource inside the course, it shows "in progress". It completes when the last 2 are done, wherever they do them.

### Step A: what members get

- **New Turkish and Arabic courses** made of video, audio and written resources, each with an optional activity and bonus content.
- **A course experience.** A resource opened from a course shows inside the course layout: the playlist alongside, "Back to course", and "Next: {resource}".
- **Ticks everywhere,** plus the "in progress" and "completed" badges on courses, following the rules above.
- **A tidy library:** one card per resource, with a "Part of …" label. Each resource's own page links to the courses it belongs to.
- **Existing courses are unchanged.**

### Step B: what it adds

- Existing courses move to the same single list of sessions, and their sessions can be reused in other courses.
- The Mailchimp and support-inbox (Front) course fields also list each resource's progress for the new courses. In Step A they hold only the course's status.

### Content team guide

1. **Create each resource once,** in the `video/`, `audio/` or `written/` folder. Add its activity and bonus content there; it then shows wherever the resource appears.
2. **Create the course in its own folder** under `courses/`. Put **no other stories in that folder.**
3. **Pick the resources, in order,** into the course's new **Sessions** field. Until Step B, only video, audio and written resources can be picked.
4. **Give the course an English working name** in the default (English) slot, even when the course isn't offered in English. Our Mailchimp field names are built from the name's initials.
   - The initials must not match an existing course. Already taken: **CB, MA, IARO, RTAR, RRYTS, SPST, HST, DBR.**
   - Matching initials would overwrite another course's Mailchimp field. Arabic or Turkish text here would likely break the field name.
   - Use plain words and spaces only, no punctuation, and keep the initials to **6 letters or fewer** (Mailchimp field tags are capped at 10 characters, and the longest is `C_<initials>_S`). Lower-case "in, and, the, from, as, or, to" are skipped; capitalised ones count.
   - **Never rename it after publishing.** The initials would change, and the member's fields would be written to names that don't exist.
5. **Set the course's Languages** (for example `tr`, `ar`). Each resource's Languages must include the same ones.
6. **Keep access settings consistent.** A resource's own "login required" and partner settings also apply inside a course. Turkish and Arabic courses must be **Public**: partner members can't use the `tr` and `ar` sites.
7. **Publish the resources before the course,** and don't add resources to a course after launch unless intended. Members who already finished it keep their completed badge and recorded completion; new members need the extra resource too.
8. **A new course, or a resource newly added to one, only gets a page after the next production deploy.** Ask a developer to redeploy once it's published.

### Reporting and emails

|                                           | Step A                                                                                                                                                               | Step B                           |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Session and resource counts               | Unchanged. Resources in new courses count as resources.                                                                                                              | Unchanged                        |
| Courses started and completed (reporting) | New courses included, following the rules above. Existing courses unchanged.                                                                                         | Same rules for every course      |
| Mailchimp and Front course status field   | Set for new courses a member has started                                                                                                                             | Every course                     |
| Mailchimp and Front course sessions field | Empty for new courses                                                                                                                                                | Filled for every course          |
| Google Analytics                          | New `COURSE_STARTED` and `COURSE_COMPLETED` events for **every** course, old and new, matching the database counts. Resource events inside a course carry the course | Same                             |
| Per-course breakdown (Slack digest)       | Old courses list their sessions, as today. New courses list their resources                                                                                          | Every course lists its resources |

Course started and completed mean the same thing everywhere: a `course_user` row is created, or turns completed. The database counts it, Mailchimp and Front get it, and GA gets one event for it. The database stays the headline number, because GA only sees visitors who accept cookies.

A course whose resources were all done elsewhere, without the member ever starting it inside the course, shows "completed" on the site. It isn't counted as started or completed in reporting or Mailchimp, because the member never took the course itself.

### Decisions needed

1. **Confirm the rule above** for courses whose resources were all done elsewhere (recommended as written).
2. **Before Step A launches:** do any Mailchimp emails or automations need to react to the new courses?
3. **Now, separate from this plan:** the Hindi version of _Dating, boundaries and relationships_ lists a first session that isn't published. Hindi members see 7 of 8 sessions and can't complete the course. That session needs publishing or replacing.

### Estimated effort

- **Step A:** about 2 weeks of frontend and 4 days of backend, in parallel, plus QA. Roughly 2 to 2.5 weeks in total. Course analytics (A9) adds about a day to each.
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
- All 32 `import-tr-ar-2026` resources are published.
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
- The Slack digest (`src/reporting/`) takes course started and completed from the database (`coursesStarted`, `coursesCompleted`, and a per-course breakdown of sessions, grouped by course name). It also takes GA4 events listed in `reporting.events.ts`, where the "Sessions" group reads `SESSION_*` events and the "Resource events" group reads `RESOURCE_*` events.

**Frontend**

- **Course route** `app/[locale]/courses/[slug]/page.tsx`:
  - Fetches the course with `resolve_relations: 'week.sessions'`. Static params come from `cdn/links`, with `dynamicParams = false`.
  - `StoryblokCoursePage` takes course progress from the `courses` slice. Only `getUserCourses` fills it: `user/me` returns no `courses`, so the `getUser` matcher leaves it unchanged. Only the course, session and library pages subscribe to `getUserCourses`. It has no language gate.
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
- Also: `bonus_block.title` and `bonus_block.content` are translatable, so the resources' bonus content can be entered per language.

#### A2. Backend: course resource lists

1. **Migration:** add a `course_resource` join table (`courseId`, `resourceId`, both foreign keys with `ON DELETE CASCADE`, composite primary key). On the entity it's a standard many-to-many, `course.resources` ⇄ `resource.courses`. No existing rows change.
2. **Webhook, course branch:**
   - Read `content.sessions` from the published course once per language (`default` plus each entry in `content.languages`), and link the course to the `resource` rows of every resource listed in any language, replacing its previous links. This matches old courses, which are linked to every session they list in any language. If a language fetch fails, the sync fails and nothing changes.
   - A listed resource with no `resource` row yet (published before the resource webhook existed) gets one now, fetched with `cdn/stories?by_uuids=`, just as publishing it would. A resource that isn't published can't be linked; the webhook logs a warning. Publish it, then the course again.
   - A course built from `weeks` has no links. Emptying a modular course's field clears them.
3. **"Has `course_resource` rows" is the only test for "new-format course"** anywhere in the backend. The frontend's test (`sessions` is a non-empty array, A4) must match it. Use one helper, `isModularCourse(content)`, everywhere on the frontend.

#### A3. Backend: course context and completion

1. **DTO:** add an optional `courseStoryblokUuid` to `ResourceUserDto` (`@SecureInput('text', { maxLength: 100 })`, optional). It applies to `POST /resource-user`, `/complete` and `/incomplete`.
2. **Fix the completion bug:** `setResourceUserCompleted` sets `completedAt` when it has to create the row.
3. **Start with a course** (`POST /resource-user` + `courseStoryblokUuid`):
   - Check the course row exists and is linked to this resource.
   - If so, find or create `course_user` (`completed: false`), then run the completion check for that course. Create with `INSERT … ON CONFLICT ("userId", "courseId") DO NOTHING RETURNING`, because a start and a complete can arrive together; only the request that inserted the row reports the start.
   - Otherwise do nothing extra.
   - The resource start itself is unchanged: it's idempotent, and returns any existing row untouched.
4. **Completion check, after any resource completion** (with or without a course):
   - For each `course_user` of this member that isn't completed, whose course is linked to this resource:
     - Take the course's linked resources that are published, as `checkCourseIsComplete` counts published sessions.
     - The course is complete when it has at least one published resource, and every one has **any** `resource_user` row for this member with `completedAt` set. Look for "any" row because `resource_user` can have duplicates.
   - **One-way:** set `completed = true` and `completedAt = now()` only on a false-to-true change, as a conditional `UPDATE … WHERE completed = false`. Only the request whose update changed a row goes on to step 5, so two completions at once don't both sync. Never clear either.
   - `/incomplete` never un-completes a course.
5. **Updates:** after creating a `course_user`, or completing one, call the existing `updateServiceUserProfilesCourse`. This sets Mailchimp and Front `C_<initials>`. `C_<initials>_S` stays empty because these courses have no `sessionUser` rows.
   - Pass a `course_user` loaded with `getCourseUser`. `serializeCourseData` reads `courseUser.course.name`, which the entity returned by `createCourseUser` or a plain update doesn't have.
6. **Non-blocking:** wrap all course logic in try/catch and log failures. A resource progress response must never fail because of course logic. Await the profile update inside the try, or attach a `.catch`: the session code fires it without awaiting, and a try/catch around an un-awaited call catches nothing.
7. **Report what changed (A9):** the resource responses gain `courseProgress`, a list of `{ storyblokUuid, name, started, completed }` for each course this request started or completed. `started` means this request created the `course_user`, and `completed` means it won the update in step 4. It's omitted when nothing changed, or when the course logic failed.
8. **Untouched:** session progress logic, `checkCourseIsComplete`, the `/courses-user` format, and the existing reporting queries. New `course_user` rows come back through `/courses-user` with `sessions: []`.

#### A4. Frontend: course resource model

**`lib/utils/courseSessions.ts`:**

- `getCourseSessions` reads `content.sessions` when `isModularCourse(content)`, and otherwise falls back to the flattened `weeks`. The fallback is removed in B3.
- Extend `CourseSession`:
  - `format: 'video' | 'audio' | 'written'` (replaces `hasVideo`);
  - `kind: 'session' | 'resource'`;
  - `loginRequired?: boolean`.
- Resources:
  - `description` = `toPlainText(content.description)`. Resource descriptions are rich text, and rendering them as a string would crash the card.
  - `minutes` = `parseMinutes(content.duration)`.
  - `href` = `/courses/<course>/<folder>/<slug>`, locale-aware.
  - `loginRequired` = `content.login_required`, or when unset the page's own default: `true` for video and audio, `false` for written (`loginRequiredByDefault`). Otherwise the playlist lock and the page disagree.
- Unresolved relations are dropped, as today.

**Elsewhere:**

- **Course route:** add `'Course.sessions'` to `resolve_relations`. Storyblok caps how many relations it resolves per request, so check its current documented limit. New courses should be far below it.
- **Library data:** `toLibraryStory` and `LibraryStory` carry `sessions`. `storyToLibraryItem` counts `sessions` before `weeks`.
- **Card UI:** `CourseSessionCard` and `SessionPlaylist` render a `FormatBadge` from `format`.

#### A5. Frontend: progress and course status

- **`sessionAndResourceProgressByUuid`:** a `Record<storyblokUuid, 'started' | 'completed'>` merged from the `resources` slice and every course's `sessions` in the `courses` slice. Used for ticks everywhere.
- **Course status:**
  - In progress: from that course's own entry in the `courses` slice (`determineCourseProgress`), for every course type.
  - Completed for a new-format course: the backend says completed, **or** the course has at least one resolved resource and every resolved resource is completed in `sessionAndResourceProgressByUuid`. This is display only, and covers resources all done elsewhere.
  - The library course cards and "Other courses" use the same function.
- **Hero CTA:** "Continue course" when the course is started or any resource has progress, otherwise "Begin course". `ctaHref` is the first unfinished resource or session.
- **`useResourceProgress`:**
  - Takes an optional `courseStoryblokUuid`.
  - Inside a course, `start` also runs when the resource is already started or completed but the course isn't started. That's how a member who did every resource elsewhere still starts the course.
  - Both calls include `courseStoryblokUuid`, but only when `contentAccessStatus` is granted. Written pages call `start` on view, before any gating, so without this check a member shown "no access" would still start the course. The backend doesn't check partner access.
- **The course resource page subscribes to `useGetUserCoursesQuery`**, as the session page does. RTK Query only refetches an invalidated query that has a subscriber, so without it the course status in the playlist, and the "course isn't started" check above, stay stale on that page.
- **`lib/api.ts`:**
  - `startResource` invalidates `UserCourses` when `courseStoryblokUuid` is set.
  - `completeResource` always invalidates it, because completing from the library can complete a course that's already started.

#### A6. Frontend: course resource route

New route `app/[locale]/courses/[slug]/[sessionSlug]/[resourceSlug]/page.tsx`. Here `sessionSlug` holds the resource folder (`video`, `audio` or `written`), so the URL is `/courses/<course>/<folder>/<slug>`.

- It doesn't overlap old session URLs, which have two segments.
- It avoids the existing slug collision.

**`generateStaticParams`:**

1. For each locale, fetch new-format courses with `getCourseStories(locale)`.
2. Collect the `sessions` uuids.
3. Map uuid to `full_slug` using `cdn/links` for the three folders.
4. Emit `{ locale, slug, sessionSlug: folder, resourceSlug }`.

Include drafts when `STORYBLOK_ENVIRONMENT === 'draft'`, as `resourceFolderStaticParams` does.

**Page:**

- Fetch the course with `resolve_relations: 'Course.sessions'`, and the resource by path `<folder>/<resourceSlug>` with the relations its own route resolves.
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
    resources: CourseSession[];
    nextItem?: CourseSession;
  }
  ```
- **When it's set:**
  - Use `sessionContainerStyle` with `SessionCourseNav`.
  - The back link goes to the course (`Courses.backToCourse`).
  - Show "Next: {name}" beside the complete action.
  - Pass `courseUuid` to `useResourceProgress`.
  - Add `course_name`, `course_storyblok_uuid` and `course_resource_position` to `eventData`.
- **Playlist locks:** today the rule is `accountNeeded && uuid !== previewSessionUuid`. Resources should lock by their own `loginRequired` instead. Add an optional `isLocked(session)` prop to `SessionPlaylist` and `SessionCourseNav`, with today's rule as the default.
- **Gating order:**
  1. Course partner access: `hasAccessToPage` with the course's `included_for_partners`.
  2. The resource's own language, partner and login gating, unchanged.
- Without `courseContext`, resource pages render exactly as today.

#### A8. Frontend: library and resource pages

- **"Part of" labels:**
  - Build a map from resource uuid to the titles of the visible courses that list it. A course is visible when it passes the locale and partner filter and isn't `coming_soon`.
  - One course: `Library.partOfCourse`. Several: a new key, `Library.partOfCourses` ("Part of {count} courses").
  - Old sessions keep `parentCourseSlug` labels until B3.
- **Activity and bonus:** if set, render them in `ResourcePageLayout`'s `beforeSections` slot:
  - activity: `SessionContentCard` with `format="activity"`;
  - bonus: `MultipleBonusContent`.
  - They show on standalone pages and inside course context alike.
- **"Part of: {Course A} · {Course B}":** links to each course overview, under the content card, using the same map. Hidden when there are none.
- **Language gate:** `ContentUnavailable reason="language"` on new-format course pages when `storyAvailableInLocale(course.languages, locale)` is false. Old courses keep today's behaviour; three of them are English-only, so gating them is a separate decision.
- **Translations:** add every new key to all 8 locales, then run `node scripts/checkTranslation.js`.

#### A9. Course analytics (every course)

Course started and completed are one funnel for old and new courses. The backend decides both, so GA is told by the backend, never worked out on the page.

**Backend:**

- **Session responses:** `POST /session-user` and `/session-user/complete` gain `courseStarted` (this request created the `course_user`, in either method's create branch) and `courseCompleted` (`checkCourseIsComplete` changed it from false to true). These are additive fields; session progress logic doesn't change.
- **Resource responses:** `courseProgress`, as in A3.7.
- **Digest, GA lines** (`reporting.events.ts`, "Courses" group): add "Course progress" with `COURSE_STARTED` (started) and `COURSE_COMPLETED` (completed), broken down by `customEvent:course_name`.
- **Digest, per-course breakdown** (`db-metrics.service.ts`): for courses with linked resources (`course_resource`), list their resources in place of sessions. For each resource, count `resource_user` rows started or completed in the range, by members who have a `course_user` for that course.
  - This is slightly broader than sessions: it includes a course member doing the resource from the library. Note that in the digest.
  - Old courses keep their session breakdown.
  - The headline `coursesStarted` and `coursesCompleted` counts already include new courses without changes.

**Frontend:**

- Add `COURSE_STARTED` and `COURSE_COMPLETED` to `lib/constants/events.ts`.
- One helper, `logCourseProgressEvents(changes, trigger)`, logs one event per started or completed course:
  - `course_name`: the backend `name`, which is the English working name. It's the same value the database breakdown and Mailchimp use, in every locale. Page events today use the localised story name, so don't join on it.
  - `course_storyblok_uuid`: use this for any join with page events.
  - `course_trigger`: `session` (old session page), `course_resource` (resource inside a course) or `standalone` (resource from the library or its own page, which can complete a course already started).
- Call it after a successful response in:
  - `useResourceProgress` `start` and `complete`;
  - `SessionMediaCard` (session start);
  - `SessionActions` (session complete).
- Never log it for the display-only "completed" in A5 (resources all done elsewhere). That would break the match with the database.
- Resource events inside a course carry `course_name` (the localised name, as session events do today), `course_storyblok_uuid` and `course_resource_position` (A7).

**GA setup:** register `course_name`, `course_storyblok_uuid`, `course_trigger` and `course_resource_position` as event-scoped custom dimensions before launch, if they aren't already. The digest breakdown fails without `course_name`.

**Continuity:** the database lines are continuous across the launch. The GA course lines start at launch, with no history, so the digest's comparison with earlier periods is empty for their first period.

#### A10. Tests, QA and rollout

**Backend unit tests:**

- The webhook links a course to its listed resources, creates missing `resource` rows, and clears them when `sessions` is emptied.
- Concurrent start and complete create one `course_user` and sync Mailchimp once.
- `courseProgress` and `courseStarted`/`courseCompleted` are true only on creation and on a false-to-true change, and `courseProgress` is omitted when course logic fails. New courses never un-complete, so they fire once. An old course can un-complete and complete again (`checkCourseIsComplete` is two-way); it fires again then, matching the database, which counts the new `completedAt`.
- The digest's per-course breakdown lists resources for courses with linked resources, and sessions for the rest.
- Start with a course: creates `course_user` only when the resource is listed, and is idempotent.
- Completion:
  - ignores unpublished resources;
  - handles duplicate `resource_user` rows;
  - is one-way;
  - is never triggered for courses not linked to the resource.
- `/incomplete` leaves the course completed.
- The completion bug fix.
- Course logic errors don't fail the resource response.
- `updateServiceUserProfilesCourse` is called on create and on complete.

**Frontend unit tests:**

- `getCourseSessions` for both shapes.
- `sessionAndResourceProgressByUuid`.
- Course status and CTA.
- Library labels for 0, 1 and 2 courses.
- Static params, including the collision.
- Playlist locks.
- `useResourceProgress` in course context.
- `logCourseProgressEvents`: one event per change, with the right `course_trigger`; nothing for display-only completion.

**QA:**

- Staging reads draft content, but the backend only knows published courses.
- A test course limited to a test partner can't be checked in `tr` or `ar`: partner members are blocked from those locales (`localeOpenToPartners`). Use it for `en`, partner and access checks only.
- For `tr` and `ar`, QA the real courses as unpublished drafts on staging. Load their `course_resource` links into the staging database with a one-off call to the course sync that reads the `draft` version. Or make the staging backend's webhook read `draft`, as the staging frontend does.
- Before publishing anything, confirm which backends the Storyblok webhook calls, because a production webhook would create real Mailchimp fields. Give the test course initials that don't collide, and remove its fields afterwards.
- Run through:
  - signed out, signed in, and partner user;
  - `en`, `tr` and `ar` (right to left);
  - the mobile playlist;
  - ticks shared across two courses and the library;
  - "in progress" only after activity inside the course;
  - completion from the library after starting inside the course;
  - all resources done elsewhere, then opening the course;
  - every existing course renders exactly as on production;
  - in GA DebugView: `COURSE_STARTED` and `COURSE_COMPLETED` fire once each for an old course (through sessions) and a new course (inside the course, and completed from the library).

**Deployment runbook** (in order)

_Done on 2026-11-02:_ the A1 schema changes are live in Storyblok (`Course.sessions` is translatable, as `week.sessions` is), plus `bonus_block.title` and `bonus_block.content` made translatable (Turkish and Arabic resources keep their text in the language slots, so untranslatable bonus fields couldn't hold it). A draft-only test course, `courses/qa-modular-course` (tag `qa-do-not-publish`), exists for staging QA. **Never publish it**; delete it after launch.

**Env vars:** none, in either repo. Existing Storyblok, revalidate and GA settings are unchanged.

_1. Backend_

1. Merge the backend PR into `develop`. Render deploys staging and runs the migration (`course_resource`).
2. Merge `develop` into `main`. Render deploys production and runs the migration. Nothing changes for members yet: no course has resources linked, and the frontend doesn't send a course. The session responses' `courseStarted`/`courseCompleted` flags and the digest's per-course resource breakdown start straight away. An older frontend's extra `courseStoryblokUuid` would be stripped, not rejected (`whitelist: true`), so the order is safe either way, but course progress needs this first.

_2. GA4, before the frontend ships_

3. **GA4** (Admin → Custom definitions → event-scoped custom dimensions): `course_name`, `course_storyblok_uuid`, `course_trigger`, `course_resource_position`. Skip any that already exist. The digest's "Course progress" breakdown needs `course_name`.

_3. Frontend_

4. Merge the frontend PR into `develop`. Vercel deploys staging.
5. **Staging QA** with the draft test course in `tr` and `ar`: signed out, signed in, partner user, mobile, right to left; every existing course renders as on production; COURSE_STARTED and COURSE_COMPLETED fire once each in GA DebugView for an old course. Staging lists draft courses, but the backends only sync published ones, so modular course progress can't be checked until a real course is published. See QA above.
6. Merge `develop` into `main`. Vercel deploys production. With no modular course published, members see no difference apart from GA's new course events.

_4. Per new course, before publishing it_

7. **Name and initials:** choose the English working name (content guide rule 4). Its initials are the first letter of each word, skipping lower-case "in, and, the, from, as, or, to": 6 letters or fewer, letters only, not already taken.
8. **Front:** Settings → Contacts → Custom fields. Add two **text** fields, named in lower case: `course_<initials>` and `course_<initials>_sessions` (for example `course_hst` and `course_hst_sessions`). Do this **before** publishing: Front receives every contact field in one update, so one missing field would block every Front update for a member who starts the course.

_5. Publish_

9. **Publish the resources, then the course.** Publishing the course creates its `course` row, links it to every resource listed in any language (`course_resource`), and creates the Mailchimp merge fields `C_<initials>` and `C_<initials>_S`. A resource published after the course is only linked once the course is published again.
10. **Mailchimp:** Audience → Settings → Audience fields. Check that `C_<initials>` ("Course <initials> Status") and `C_<initials>_S` ("Course <initials> Sessions") exist. If not, add both as text fields with exactly those tags.
11. **Check the backend rows** (every listed resource should appear, published):
    ```sql
    SELECT c.name, r.name, r.status FROM course c
    JOIN course_resource cr ON cr."courseId" = c."courseId"
    JOIN resource r ON r."resourceId" = cr."resourceId"
    ORDER BY c.name;
    ```
12. **Redeploy production.** The course and course resource routes use `dynamicParams = false`, so a page that didn't exist at build time 404s, and the revalidate webhook can't add it. Open every new course and course resource URL in `tr` and `ar`. If the build still misses them, purge Vercel's Data Cache and redeploy.
13. **Smoke test** with a test account: open a resource inside the course, check the course shows "in progress", that the `course_user` row exists, and that Mailchimp and Front show `C_<initials>` as started.

_6. After launch_

14. **Translations:** `Library.partOfCourses` and `Resources.partOf` are English placeholders in the 7 other locales. Send them to translators (Turkish and Arabic first).
15. Delete `courses/qa-modular-course` from Storyblok.

**Rollback:** revert the frontend PR. The `course_resource` table and any new `course_user` rows are harmless if left.

#### Step A risks

| Risk                                               | Mitigation                                                                                                                                                                                                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Existing courses regress                           | Every new backend path requires `course_resource` links. Frontend `weeks` fallback, tests on current fixtures, and a staging comparison of every existing course                                                                                       |
| Wrong or early course completion                   | Verified on the server from `resource_user`. Unpublished listed resources are logged by the webhook. One-way                                                                                                                                           |
| Mailchimp field overwrite or failure               | Content rule 4 (unique Latin initials). Failures are logged only                                                                                                                                                                                       |
| Front rejects a new course field                   | Front's PATCH sends the full set and throws, so one rejected field would block **every** Front field update for that member. Create the new courses' Front fields if existing ones were created by hand, and check with one test contact before launch |
| Test content reaching production                   | Test course limited to a test partner. Check webhook targets first                                                                                                                                                                                     |
| Same content at several URLs                       | Canonical points to the resource's own URL                                                                                                                                                                                                             |
| New analytics parameters not visible in GA reports | Register them as custom dimensions before launch (A9)                                                                                                                                                                                                  |
| GA and database course counts differ               | Expected: GA only sees visitors who accept cookies. The database is the headline number; GA is for breakdowns and funnels                                                                                                                              |

---

### Step B: one model for all courses

#### B1. Backend

1. **Session links:** a `course_session` join table, the counterpart of `course_resource`. `session.courseId` stays the session's home course; the join table lets a session appear in other courses. Until B3, the webhook fills it from the flattened `weeks`.
2. **Session context:** an optional `courseStoryblokUuid` on the session-user DTOs, with the same rules as A3. Without it, sessions fall back to their home course, as today.
3. **One `session_user` per member and session:** before creating, look for an existing row for this member and session across their `course_user` rows. If several exist, use the oldest. Otherwise create it under the context course.
4. **One completion check** for sessions and resources, replacing `checkCourseIsComplete`. It's one-way. Courses with neither kind of link keep the old logic.
5. **Response:** `formatCourseUserObject` and `serializeCourseData` build `sessions` and `C_<initials>_S` from the course's linked sessions and resources plus progress.
   - The digest's per-course breakdown also moves to the join tables for every course, counting each resource from `session_user` or `resource_user` as it is.
   - `courseStarted`, `courseCompleted` and `courseProgress` (A9) keep their meaning; for a reused session they refer to the context course.
6. **`resource_user` unique index** on (`userId`, `resourceId`), after a duplicate check and cleanup plan on production data.

#### B2. Frontend

- Send `courseStoryblokUuid` from old session pages too.
- Session events carry the context course's `course_storyblok_uuid`, not the session's home course.
- Remove the new-format special cases, so one path serves every course.

#### B3. Content migration

1. A script using the Management API tooling in `scripts/` copies each course's flattened `weeks` into `sessions`. including per-language values (`sessions__i18n__hi`). It **skips any story with `unpublished_changes`**: today that's `creating-boundaries`.
2. Widen the `Course.sessions` picker to `Session` and `session_iba`.
3. Check every course and locale through the CDN: the new list equals the flattened old list.
4. Deploy, and let it run in production for a while.
5. Remove `weeks`, the `week` component and the frontend fallback.

**Open design point:** URLs for an old session reused in a different course. Either link to its home URL, or extend the A6 course resource route to old sessions.

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
