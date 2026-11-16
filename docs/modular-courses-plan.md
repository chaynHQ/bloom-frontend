# Modular courses

Bloom is moving every course onto one model: a course is an ordered list of library resources, and one resource can sit in several courses without being copied.

| Step  | What                                                                                                                                                                     | Status                                                                                                                                                            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A** | Courses can list resources instead of weeks of sessions, per language. Course progress, reporting, Mailchimp and Front work for them. Existing courses keep their weeks. | Released (bloom-backend [#1296](https://github.com/chaynHQ/bloom-backend/pull/1296), bloom-frontend [#2022](https://github.com/chaynHQ/bloom-frontend/pull/2022)) |
| **B** | Convert every session into a video resource, move every course onto its resource list, and remove weeks and sessions.                                                    | Planned                                                                                                                                                           |

How the model works, and how to add a course, is in [courses-sessions-and-resources.md](courses-sessions-and-resources.md). This document records what Step A built and why, and the plan for Step B.

- [Part 1: Step A](#part-1-step-a)
- [Part 2: Step B, finishing modularisation](#part-2-step-b-finishing-modularisation)
- [Known issues](#known-issues)

---

## Part 1: Step A

### Why

- Every course session was a video built for exactly one course.
- The Turkish and Arabic courses needed steps that are video, audio, written or grounding, each with an optional activity and bonus content.
- The same resource should appear in several courses, and in the library, without being duplicated.

### The rules members see

These apply to courses built from resources. Step B applies them to every course.

| What                   | Rule                                                                                                                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Resource tick          | A resource done anywhere is ticked everywhere: in the library, in every course that lists it, and on its own page                                                                      |
| Course **in progress** | The member has done something _inside this course_. Resources done from the library or another course don't start it                                                                   |
| Course **completed**   | Every published resource the course lists is done, wherever it was done. The backend counts resources listed in any language, so languages that list resources must list the same ones |
| Library                | Each resource is listed once, with a "Part of {course}" or "Part of {n} courses" label                                                                                                 |

Example: a member listened to 3 of a course's 5 resources from the library. When they open the course, those 3 are ticked and the course isn't started yet. Once they play a resource inside the course, it shows "in progress". It completes when the last 2 are done, wherever they do them.

A course whose resources were all done elsewhere, without the member starting it inside the course, shows "completed" on the site. It isn't counted as started or completed in reporting or Mailchimp, because the member never took the course itself.

### Storyblok

| Component                                              | Change                                                                                                                                                |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Course`                                               | New translatable `sessions` field: an ordered story picker limited to `resource_video`, `resource_audio`, `resource_written` and `resource_grounding` |
| `resource_video`, `resource_audio`, `resource_written` | Optional `activity` (rich text) and `bonus` (`bonus_block` bloks)                                                                                     |
| `bonus_block`                                          | `title` and `content` made translatable                                                                                                               |
| `week`                                                 | The deleted `session_granular` removed from `sessions`                                                                                                |

The field is called `sessions` because Step B moves every course onto it. Every change was additive; no existing story changed.

### Backend

**Course resource links.** A `course_resource` join table (`courseId`, `resourceId`, both foreign keys with `ON DELETE CASCADE`) backs a standard many-to-many, `course.resources` ⇄ `resource.courses`. When a course is published, the Storyblok webhook (`getCourseResources` in `webhooks.service.ts`):

- reads `sessions` from the published course in the default language and in each of its `languages`, and links the course to every resource listed in any of them, replacing the old links. If a language fetch fails, nothing is saved;
- creates a `resource` row for any listed resource that doesn't have one yet;
- logs a warning for listed resources it can't find (usually unpublished). Publish them, then publish the course again.

A course with links is a "resources course" everywhere in the backend. A weeks course has none.

**Progress inside a course.** `ResourceUserDto` takes an optional `courseStoryblokUuid` on `POST /resource-user`, `/complete` and `/incomplete`. `updateCourseUserProgress` in `resource-user.service.ts`:

- **Start:** when the resource is linked to that course, create the `course_user` if it's missing (`createCourseUserIfMissing`, an insert that ignores conflicts, so a start and a complete arriving together create one row).
- **Completion check:** after any resource completion, with or without a course, check each of the member's incomplete courses that link this resource. The course is complete when it has at least one published linked resource and the member has a completed `resource_user` row for every one (`checkCourseResourcesAreComplete`). `resource_user` has no unique index, so any completed row counts.
- **One-way:** `setCourseUserCompletedIfIncomplete` only changes `false` to `true`, so concurrent completions sync once. `/incomplete` never un-completes a course.
- **Sync:** after a start or a completion, Mailchimp `C_<initials>` and Front `course_<initials>` are updated. `C_<initials>_S` and `course_<initials>_sessions` stay empty, because resources courses have no `session_user` rows.
- **Non-blocking:** course logic runs in a try/catch and is logged on failure. A resource response never fails because of it.
- **Response:** `courseProgress` lists `{ storyblokUuid, name, started, completed }` for each course this request started or completed, and is omitted otherwise.

Also fixed: `setResourceUserCompleted` used to create the row without `completedAt` when completion arrived before the start.

**Sessions** are unchanged, except that `POST /session-user` and `/complete` now return `courseStarted` and `courseCompleted`.

### Frontend

- **Model** (`lib/utils/courseSessions.ts`): `isModularCourse(content)` is true when `sessions` lists anything in this locale. `getCourseSessions` returns resources for a resources course, otherwise `getCourseWeekSessions`. A `CourseSession` carries `format` (`video`, `audio`, `written` or `grounding`), `kind` (`session` or `resource`) and `loginRequired`.
- **Resolving resources:** Storyblok only resolves `Course.sessions` when the default language lists resources. `resolveCourseResources` (`lib/storyblok.ts`) fetches the uuids it leaves unresolved.
- **Course page:** a resources course shows its numbered list and no intro video. A course offered only in other languages, or a resources course outside its languages, shows "not available in your language".
- **Course resource route:** `/courses/<course>/<folder>/<slug>` (`app/[locale]/courses/[slug]/[sessionSlug]/[resourceSlug]/page.tsx`). It renders the resource's own page with a `CourseContext`: the course side menu (`SessionCourseNav`), "Back to course", "Next: {resource}", and locks taken from each resource's `loginRequired`. The canonical URL is the resource's own page. Course partner access is checked first, then the resource's own language, partner and login rules.
- **Progress:** `useResourceProgress` sends `courseStoryblokUuid` once the member can see the resource. Inside a course, `start` also runs when the resource is already done but the course isn't started yet. `getCourseProgress` adds the display-only completion. The course resource page subscribes to `useGetUserCoursesQuery`, so course status refreshes after progress.
- **Library and labels:** one card per resource, labelled with its visible courses (`Library.partOfCourse` and `partOfCourses`). A resource page lists its courses under the content (`Resources.partOf`), or inside a course, the other courses (`Resources.alsoPartOfCourses`). A resource's activity and bonus show on its own page and inside courses.
- **Grounding:** a grounding exercise is a normal course step. It renders on the shared text resource page and is marked done like a written resource.

There are no feature flags and no new env vars.

### Analytics

- **Every course, old and new:** `COURSE_STARTED` and `COURSE_COMPLETED` fire once per change the backend reports (`logCourseProgressEvents`), with `course_name` (the backend's English name), `course_storyblok_uuid` and `course_trigger` (`session`, `course_resource` or `standalone`). The display-only completion never fires them.
- **Resource events inside a course** also carry `course_name`, `course_storyblok_uuid` and `course_resource_position`.
- **Slack digest:** a "Course progress" line from GA, and a per-course breakdown from the database. Weeks courses list sessions; resources courses list resources, counting `resource_user` rows by members who have a `course_user` for that course.
- The database is the headline number. GA only sees visitors who accept cookies, and its course lines start at the Step A release.

|                                           | Before Step A | After Step A                                            |
| ----------------------------------------- | ------------- | ------------------------------------------------------- |
| Session and resource counts               | Unchanged     | Unchanged. Resources inside courses count as resources  |
| Courses started and completed             | Weeks courses | Every course                                            |
| Mailchimp and Front course status         | Weeks courses | Every course                                            |
| Mailchimp and Front course sessions field | Weeks courses | Weeks courses; empty for resources courses until Step B |

### Courses using resource lists

| Course                                          | Turkish and Arabic                                    | Other languages      |
| ----------------------------------------------- | ----------------------------------------------------- | -------------------- |
| Image-based abuse and rebuilding ourselves      | 8 resources                                           | English weeks        |
| Recovering from toxic and abusive relationships | 12 resources                                          | English weeks        |
| Healing from sexual trauma                      | 9 resources                                           | Weeks in 6 languages |
| Society, patriarchy, and sexual trauma          | 6 resources; titled "Society, patriarchy, and trauma" | Weeks in 6 languages |
| Body-based healing                              | 5 resources, including a grounding exercise           | Not offered          |

---

## Part 2: Step B, finishing modularisation

**Goal:** one model. Every course is an ordered list of resources in each language; every session becomes a `resource_video`; `weeks`, `week`, `Session` and `session_iba` are removed, along with the session code paths. Members keep their progress, and old session URLs redirect.

Converting sessions into resources replaces the earlier idea of keeping sessions and adding a `course_session` join table. It leaves one content type, one progress table and one completion rule, and session content becomes reusable in other courses and searchable in the library like any resource.

### What there is to convert

Checked against Storyblok on 2026-11-03:

- **58 sessions:** 48 `Session` and 10 `session_iba`, all published, in 8 course folders. Two are `coming_soon`, in the unpublished "Creating boundaries" and "Managing anxiety" courses.
- **Fields:** 51 have an activity, 41 have bonus content and 1 has a `video_outro`. `Session.bonus` is rich text; `session_iba.bonus` is `bonus_block` bloks, which resources already use.
- **Slugs:** `final-reflections` appears in 4 courses, and `fear-in-the-body` and `what-are-boundaries` in 2 each. Four session slugs already exist in `video/`: both `what-are-boundaries` sessions, IARO's `fear` and SPST's `enthusiastic-consent`. Some of those may be the same video, which should reuse the existing resource instead.
- **Languages:** session lists match across languages except Hindi "Dating, boundaries, and relationships" (see [Known issues](#known-issues)).

### Field mapping

| Session field                                                                                                                                              | `resource_video` field                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `name`, `subtitle`, `seo_description`, `seo_keywords`, `video`, `duration`, `video_transcript`, `activity`, `languages`, `included_for_partners`, `themes` | Same name                                                                                                               |
| `description` (plain text)                                                                                                                                 | `description` (rich text, one paragraph)                                                                                |
| `bonus` (rich text, `Session`)                                                                                                                             | One `bonus_block` with that content                                                                                     |
| `bonus` (bloks, `session_iba`)                                                                                                                             | `bonus` as is                                                                                                           |
| `video_outro` (1 session)                                                                                                                                  | Appended to `activity`, or a new optional field. Decide when converting                                                 |
| `course`                                                                                                                                                   | Dropped; the course lists the resource instead                                                                          |
| `coming_soon`, `coming_soon_content`                                                                                                                       | Dropped; only used in two unpublished courses                                                                           |
| Free preview of a Public course's first session                                                                                                            | `login_required: false` on that course's first resource; every other converted resource keeps the video default, `true` |

Every `__i18n__<lang>` value is copied with its field.

### B1. Backend first

1. **Per-language course lists.** Add `language` to `course_resource` (part of the key). The webhook writes each language's list separately, and a course is complete when every published resource in **any one** language's list is done. Today's union rule would block mixed courses after conversion: an English list of videos plus a Turkish list of audio would need all of both.
2. **`resource_user` unique index** on (`userId`, `resourceId`), after measuring duplicates and merging them, keeping the earliest `createdAt` and any `completedAt`.
3. **Course sessions field from resources:** `serializeCourseData` fills `C_<initials>_S` and `course_<initials>_sessions` from the course's linked resources and the member's `resource_user` rows, in the existing `<initials>:C|S` format.
4. **Progress backfill script:** from the conversion's mapping file (session uuid → resource uuid), create or update `resource_user` for every `session_user`, keeping `createdAt` and `completedAt`. It runs per course and has a dry run. `course_user` rows are kept as they are; completion stays one-way, so nobody loses a completed course.

### B2. Frontend

1. **Redirects:** permanent redirects from `/courses/<course>/<session>` (with any locale prefix) to `/courses/<course>/video/<slug>`, generated from the mapping file into `next.config.js`.
2. **Course intro video:** today it only shows on weeks courses, so converting would hide it everywhere. Either make it a "Welcome" video resource at the top of the list (it then counts towards completion) or show `Course.video` on every course in its default language only. Decide before converting.
3. **Analytics:** sessions stop sending `SESSION_*` events; the same steps send `RESOURCE_VIDEO_*` with course context. Update [analytics-events.md](analytics-events.md) and the digest's "Sessions" group, and note the break in the session lines.

### B3. Convert one course at a time

A course can be converted on its own, because the frontend already decides weeks or resources per locale.

1. **Script, dry run** (Management API tooling in `scripts/`): for each session, a `resource_video` draft in `video/`. For a session listed in more than one week list, one resource. Unique slugs, using `<slug>-<course>` where the plain slug is taken. Then the course's flattened `weeks` go into `sessions`, in each language whose list differs from the default. Output: the drafts and a mapping file. Skip any story with unpublished changes.
2. **Review on staging,** which reads drafts. Compare every locale's new list with the old flattened one.
3. **Publish the resources,** run the backfill for that course, then **publish the course.** The webhook links the resources per language, and members' ticks and completions carry over.
4. **Deploy** the redirects for that course.
5. **Unpublish the course's sessions** once the redirects work. Keep the stories until every course is done.

Start with a small published course (SPST has 6 sessions), let it run in production, then do the rest. Courses already listing Turkish and Arabic resources keep those lists; only their default (and Hindi, where it differs) is converted.

### B4. Remove the old model

Once every course is converted:

- **Storyblok:** delete the session stories and the `Session`, `session_iba` and `week` components, then the `Course.weeks`, `video_transcript` (if the intro became a resource) and live course fields that nothing reads.
- **Frontend:** the session route and `StoryblokSessionPage`, `getCourseWeekSessions`, the library's `courseSessions`, `freeFirstSessionUuids`, `pathRequiresAccount` and `parentCourseSlug`, session events, and the `isModularCourse` branches.
- **Backend:** the `/session-user` endpoints, `checkCourseIsComplete`, and the webhook's session branch. Keep the `session` and `session_user` tables for history and reporting.

### B5. Safety checklist

1. Take a Render database backup before each course's backfill.
2. Run read-only checks on a production snapshot:
   ```sql
   -- duplicate resource_user rows (before the unique index)
   SELECT "userId", "resourceId", count(*) FROM resource_user
   GROUP BY 1, 2 HAVING count(*) > 1;

   -- session_user rows under a course other than the session's own
   SELECT count(*) FROM session_user su
   JOIN course_user cu ON cu."courseUserId" = su."courseUserId"
   JOIN session s ON s."sessionId" = su."sessionId"
   WHERE s."courseId" <> cu."courseId";
   ```
3. Dry-run each course's backfill on the snapshot. Compare current and recalculated completion for every `course_user`. Expect **zero un-completions**, and list each new completion.
4. Confirm which Mailchimp automations read `C_*` fields, and whether anyone queries the database directly.
5. Fix the Hindi "Dating, boundaries, and relationships" list before converting that course.

**Effort:** roughly 2 to 3 weeks across both repos, plus a week of content checks, done course by course.

---

## Known issues

| Issue                                                                                                                              | Impact                                                                                                              | Action                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Hindi "Dating, boundaries, and relationships" lists `courses/creating-boundaries/what-are-boundaries` first, which isn't published | Hindi members see 7 of 8 sessions, and the backend expects 8, so the course can't be completed in Hindi             | Content: replace it with the DBR session, or publish it |
| A mixed course's session check is two-way                                                                                          | A member who completes it through resources, then completes an English session, can have it marked incomplete again | Rare. Gone after Step B                                 |
| `resource_user` has no unique index                                                                                                | Duplicates can inflate resources-started counts                                                                     | Completion tolerates them; index in B1                  |
| Grounding exercises only track progress inside courses                                                                             | Doing one on `/grounding` doesn't tick it in a course                                                               | By design                                               |
| `getStoryblokStory`'s `uuids` argument requests `cdn/stories/false`                                                                | None; unused                                                                                                        | Remove it, or fetch with `find_by: 'uuid'`              |
