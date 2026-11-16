# Courses, sessions and resources

Bloom's learning content comes in three Storyblok content types. **Resources** are standalone library pages. **Sessions** exist only inside a course. **Courses** group either sessions (in weeks) or resources, and each language makes that choice separately.

This guide covers how each type is modelled, rendered and tracked. For why courses can list resources, and the plan to move every course onto them, see [modular-courses-plan.md](modular-courses-plan.md). Content editors have their own guide, which is not in the repo.

## The three types

| Type     | Storyblok component                                                                               | Lives in                                                  | URL                                                                       | Listed in the library                                    |
| -------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------- |
| Resource | `resource_video`, `resource_audio`, `resource_written`, `resource_activity`, `resource_grounding` | `video/`, `audio/`, `written/`, `activity/`, `grounding/` | `/<folder>/<slug>`. Grounding opens in a dialog on `/grounding?id=<slug>` | Yes, except grounding (it has its own `/grounding` page) |
| Session  | `Session`, `session_iba`                                                                          | `courses/<course>/`                                       | `/courses/<course>/<session>`                                             | Yes, as a single session, while its course is visible    |
| Course   | `Course`, the start page of its folder                                                            | `courses/<course>/`                                       | `/courses/<course>`                                                       | Yes, unless `coming_soon`                                |

One resource can sit in any number of courses without being copied. A session belongs to exactly one course, through its `course` field and its folder.

## Resources

All resource types share `name`, `description` (rich text), `duration` (whole minutes as text, for example `"7"`), `languages`, `included_for_partners`, `themes`, `seo_description` and `seo_keywords`. Most also have `related_content`, `related_grounding` and `related_session`, plus an optional `activity` and `bonus` shown wherever the resource appears.

| Type      | Media                                       | Page component                                                                 | Login when `login_required` is unset |
| --------- | ------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------ |
| Video     | `video` (YouTube link) + transcript         | `StoryblokResourceVideoPage`                                                   | Required                             |
| Audio     | `audio` asset + transcript                  | `StoryblokResourceAudioPage`                                                   | Required                             |
| Written   | `body` rich text                            | `StoryblokResourceWrittenPage`                                                 | Not required                         |
| Activity  | `body` rich text                            | `StoryblokResourceActivityPage`                                                | Not required                         |
| Grounding | `body` rich text (often with an audio blok) | `GroundingExerciseDialog`, or `StoryblokResourceGroundingPage` inside a course | Not required (no field)              |

Written, activity and grounding pages share `StoryblokTextResourcePage`. The shared data, access and progress wiring is `useStoryblokResourcePage`, and the layout is `ResourcePageLayout`.

**Progress:** `useResourceProgress` records `started` on first engagement (play, transcript, or page view for text resources) and `completed` when the media ends or the member marks it done. The backend stores it in `resource_user`. Grounding exercises only track progress inside a course; the `/grounding` dialog logs events but no progress.

## Sessions

A session is a course-only page with a `video`, `video_transcript`, `video_outro`, `activity` and `bonus` (`session_iba` takes bonus bloks instead of rich text). It is rendered by `StoryblokSessionPage` at `app/[locale]/courses/[slug]/[sessionSlug]/page.tsx`.

- Sessions are grouped by the course's `weeks`. Within a week they follow the order of the pages in the course folder, as the `week.sessions` field description says.
- In a course open to `Public`, the first session is a full preview for signed-out visitors, and later sessions show a sign-up card. Any page under `courses/<course>/` needs an account in the library (`pathRequiresAccount`).
- Progress is a `session_user` row. The backend completes a course when every published session in it is done (`checkCourseIsComplete`).

## Courses

A `Course` story is the start page of its own folder under `courses/`. The folder's position in Storyblok sets the course order in the library. Key fields:

| Field                                                    | Translatable                                   | Used for                                                        |
| -------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------- |
| `name`, `description`, `seo_description`, `seo_keywords` | Yes                                            | Cards, course page, search                                      |
| `image`, `image_with_background`                         | `image` only                                   | Card and page header art                                        |
| `video`, `video_transcript`                              | Yes                                            | Intro video, shown for weeks courses only                       |
| `weeks`                                                  | No (a `week` blok's `name` and `sessions` are) | Sessions grouped into weeks                                     |
| `sessions`                                               | Yes                                            | An ordered list of resources (video, audio, written, grounding) |
| `languages`                                              | No                                             | Which locales the course is offered in                          |
| `included_for_partners`                                  | No                                             | `Public` and/or partner names                                   |
| `coming_soon`, `live_*`                                  | Partly                                         | Hides content, or advertises live runs                          |

### Weeks or resources, per language

Each language decides how its course is built:

|                      | Built from weeks                        | Built from resources                                                                                              |
| -------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Decided by           | `sessions` is empty in this language    | `sessions` lists at least one resource in this language                                                           |
| Course page shows    | Weeks of sessions, plus the intro video | A numbered list of resources, no intro video                                                                      |
| Opening an item      | `/courses/<course>/<session>`           | `/courses/<course>/<folder>/<slug>`                                                                               |
| Progress             | `session_user`                          | `resource_user`                                                                                                   |
| Course complete when | Every published session is done         | Every published resource listed in any language is done, so languages that list resources must list the same ones |

The test is `isModularCourse(content)` in `lib/utils/courseSessions.ts`, run on the locale's resolved story. `getCourseSessions` returns resources for a resources course and otherwise falls back to `getCourseWeekSessions`. Session pages always use `getCourseWeekSessions`, because a course can keep its weeks in English and list resources in Turkish.

A course can be mixed this way: the English version keeps its weeks and sessions, and the Turkish and Arabic versions list resources. It is still one course with one backend record and one set of Mailchimp and Front fields, and reporting counts every language together.

**Gotchas:**

- Storyblok only resolves `Course.sessions` relations when the default language lists resources too. `resolveCourseResources` (in `lib/storyblok.ts`) fetches any that come back as bare uuids. Unpublished resources stay uuids and are skipped.
- A course offered only in other languages shows "not available in your language" in the rest. Weeks courses that aren't offered in a language still render there, as they always have; only resources courses, and courses with nothing to show, are gated.
- A grounding exercise is a normal course step. It is marked done like a written resource and counts towards completion.

### The course resource route

`app/[locale]/courses/[slug]/[sessionSlug]/[resourceSlug]/page.tsx` renders a resource inside its course. `sessionSlug` holds the resource's folder, because a slug can exist in two folders, and Next.js requires sibling dynamic segments to share a name. `RESOURCE_PAGES` maps each folder to its page component.

Like every Storyblok route, it pre-renders the pages that exist at build time and renders any other on its first visit, then caches it. A new course, or a resource newly listed in a course, is live once published, with no redeploy. An address with no matching story returns a 404 (`notFound()`).

## Progress and completion

| Record            | Created when                                                      | Notes                                                              |
| ----------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| `course_user`     | A member starts a session, or starts a resource inside the course | Sent to Mailchimp (`C_<initials>`) and Front (`course_<initials>`) |
| `session_user`    | A session is started                                              | Weeks courses only                                                 |
| `resource_user`   | A resource is started anywhere                                    | Ticks the resource in every course that lists it                   |
| `course_resource` | The course is published (Storyblok webhook)                       | Links the course to every resource listed in any language          |

- The frontend sends `courseStoryblokUuid` with resource progress inside a course, so the backend can start or complete that course.
- A resources course whose resources were all done elsewhere shows as completed on the site, but it isn't counted as started or completed in reporting or Mailchimp.
- Known gap: a member who uses a mixed course in two languages can have a completion undone by the session-based check. This is rare, and Step B of the plan removes it.

## Access

Three rules apply on top of each other: the course's own rules, then the resource's.

- **Languages:** a story is shown in a locale only if its `languages` includes it (`default` for English, see `storyAvailableInLocale`). Each resource a course lists must be offered in that course's languages.
- **Partners:** `included_for_partners` must include `Public` or one of the member's partners. Turkish and Arabic are only open to `Public` content.
- **Login:** a resource's own `login_required` also applies inside a course, so a signed-out visitor may see some steps locked.

## Adding a course

1. **Initials:** the backend names a course's Mailchimp and Front fields after the initials of its English name (`getAcronym`: the first letter of each word, skipping lower-case "in, and, the, from, as, or, to"). Give every course an English working name, even one not offered in English, with unique initials of 6 letters or fewer. Taken: CB, MA, IARO, RTAR, RRYTS, SPST, HST, DBR, BH. Never rename a published course.
2. **Front:** add text fields `course_<initials>` and `course_<initials>_sessions` before publishing. Front replaces every contact field in one update, so a missing field blocks all Front updates for anyone who starts the course.
3. **Mailchimp:** add text fields `C_<INITIALS>` and `C_<INITIALS>_S` before publishing. The webhook tries to create them on first publish, but only once, and only logs a failure.
4. **Publish the resources, then the course.** The webhook links the course to its resources; a resource published later is only linked when the course is published again. The new pages render on their first visit, so no redeploy is needed.

For an existing course offered in a new language, skip steps 1 to 3, and check that no Mailchimp automation on the course's fields would send members the wrong language.

## Adding a resource type to courses

1. Add the component to `Course.sessions`' allowed content types in Storyblok.
2. Add it to `RESOURCE_FORMATS` and `LOGIN_REQUIRED_BY_DEFAULT` in `lib/utils/courseSessions.ts`.
3. Add its folder and page to `RESOURCE_PAGES` in the course resource route.
4. Give its page a `RESOURCE_CATEGORIES` value and a `ResourceEventPrefix`, with matching events in `lib/constants/events.ts`.
5. Check that the backend webhook maps the component to a resource category (`webhooks.service.ts`).

## Where the code is

| Concern                  | Frontend                                                                   | Backend                                      |
| ------------------------ | -------------------------------------------------------------------------- | -------------------------------------------- |
| Course model and helpers | `lib/utils/courseSessions.ts`, `lib/utils/libraryData.ts`                  | `src/entities/course.entity.ts`              |
| Course page              | `components/storyblok/StoryblokCoursePage.tsx`                             |                                              |
| Session page             | `components/storyblok/StoryblokSessionPage.tsx`                            | `src/session-user/session-user.service.ts`   |
| Resource pages           | `components/storyblok/StoryblokResource*Page.tsx`, `components/resources/` | `src/resource-user/resource-user.service.ts` |
| Course side menu         | `components/session/SessionCourseNav.tsx`                                  |                                              |
| Library                  | `lib/hooks/useLibraryItems.ts`, `lib/utils/getLibraryStories.ts`           |                                              |
| Storyblok sync           | `lib/storyblok.ts`                                                         | `src/webhooks/webhooks.service.ts`           |
| Analytics                | [analytics-events.md](analytics-events.md)                                 | `src/reporting/`                             |
