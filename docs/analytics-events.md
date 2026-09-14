# Analytics events

Every analytics event in the app. Event name constants live in [`lib/constants/events.ts`](../lib/constants/events.ts);
the backend event-log names live in `EVENT_LOG_NAME` in [`lib/constants/enums.ts`](../lib/constants/enums.ts).

## How events are sent

- `logEvent(name, params?)` ([`lib/utils/logEvent.ts`](../lib/utils/logEvent.ts)) sends to **Google Analytics 4**
  (`sendGAEvent`) and **Vercel Analytics** (`track`).
- GA runs under **Google Consent Mode v2**. `analytics_storage` defaults to `denied`; it flips to `granted`
  only when the visitor accepts cookies in `CookieBanner`. Ad-storage stays denied in both states. Vercel
  Analytics is cookieless and always on.
- **`useLogEventOnce(name, params, ready?)`** ([`lib/hooks/useLogEventOnce.ts`](../lib/hooks/useLogEventOnce.ts))
  fires a single event on the first render where `ready` is true. Used for all `*_VIEWED` page events.
  Callers that put user state in the payload (`*_logged_in`, event-user data) pass `ready = false` until
  auth has settled, so a signed-in visitor is never reported as anonymous — `HOME_VIEWED`, `WELCOME_VIEWED`,
  `LIBRARY_VIEWED`, `GROUNDING_VIEWED`, `MESSAGING_VIEWED`, `COURSE_OVERVIEW_VIEWED`, `SESSION_VIEWED`,
  `${PREFIX}_VIEWED`. **`NOTES_VIEWED` is an exception** — it is not gated, so `notes_logged_in` can
  report `false` for a signed-in visitor whose `getUser` is still in flight (bug). `LOGIN_VIEWED`,
  `REGISTER_VIEWED`, `RESET_PASSWORD_VIEWED`, `SETTINGS_VIEWED` send no user-dependent payload so gating
  doesn't matter for them.
- **`createEventLog({ event })`** (`useCreateEventLogMutation`) writes a row to the bloom-backend event log —
  a separate channel from GA, used for a few product-metric events (see [Backend event log](#backend-event-log)).

## Conventions

- **Param names are `snake_case`**, prefixed by domain (`resource_`, `library_`, `session_`, `course_`,
  `home_`, `grounding_`, `card_` for cross-surface card clicks, …). A few older events keep legacy `camelCase` / bare keys
  (`sessionId`, `feedbackTags`, `count`, `active`, `partner`, `message`) for dashboard continuity.
- **Event-user data** — most non-trivial events spread `getEventUserData(...)`: `account_type`, `registered_at`,
  and (when the user has partner access) `partner`, `partner_live_chat`, `partner_therapy`,
  `partner_therapy_remaining`, `partner_therapy_redeemed`, `partner_activated_at`.
- **Content identity** — content events carry the name **and** the Storyblok uuid
  (`resource_name` + `resource_storyblok_uuid`, `course_name` + `course_storyblok_uuid`, …) plus `*_themes`
  and `*_progress` where they apply.
- **`eventPrefix` templating** — media / progress / expand-collapse events are built from a prefix string
  rather than a named constant, e.g. `` `${eventPrefix}_VIDEO_STARTED` ``. The prefix constants exist in
  `events.ts` marked _"Event in use but not exported - applied using eventPrefix"_.
- **`*_VIEWED`** = landed on the page/section (once per mount, after auth settles).
  **`*_CLICKED`** = a deliberate tap. **`*_REQUEST` / `*_SUCCESS` / `*_ERROR`** = an API call's lifecycle.

---

## Auth & user loading

| Event                                                                         | Fires                                                      | Key params                                  |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------- |
| `LOGIN_VIEWED`                                                                | `LoginPage` mount                                          | —                                           |
| `LOGIN_REQUEST` / `LOGIN_SUCCESS` / `LOGIN_ERROR`                             | `LoginForm` submit lifecycle                               | `message` on error                          |
| `REGISTER_VIEWED`                                                             | `RegisterPage` mount                                       | `register_partner`                          |
| `REGISTER_REQUEST` / `REGISTER_SUCCESS` / `REGISTER_ERROR`                    | `BaseRegisterForm` submit lifecycle                        | `message` on error                          |
| `RESET_PASSWORD_VIEWED`                                                       | `ResetPasswordPage` mount                                  | `reset_password_stage` (`request` \| `set`) |
| `RESET_PASSWORD_REQUEST` / `RESET_PASSWORD_SUCCESS` / `RESET_PASSWORD_ERROR`  | `ResetPasswordForm`                                        | `message` on error                          |
| `LOGOUT_REQUEST`                                                              | `UserMenu` logout                                          | —                                           |
| `LOGOUT_SUCCESS` / `LOGOUT_FORCED`                                            | `useLoadUser`                                              | —                                           |
| `GET_LOGIN_USER_REQUEST/SUCCESS/ERROR`, `GET_AUTH_USER_REQUEST/SUCCESS/ERROR` | `useLoadUser`, `LoginForm`                                 | `message` on error                          |
| `GET_USER_REQUEST` / `GET_USER_SUCCESS` / `GET_USER_ERROR`                    | `useLoadUser` — **deprecated**, kept until callers migrate | `message` on error                          |
| `RESET_PASSWORD_HERE_CLICKED`, `CREATE_ACCOUNT_LINK_CLICKED`                  | links on `LoginForm`                                       | —                                           |

## Onboarding (About You)

| Event                                  | Fires                     | Key params         |
| -------------------------------------- | ------------------------- | ------------------ |
| `ABOUT_YOU_VIEWED`                     | `AboutYouPage` mount      | —                  |
| `ABOUT_YOU_DEMO_REQUEST/SUCCESS/ERROR` | `AboutYouDemographicForm` | event-user data    |
| `ABOUT_YOU_SETA_REQUEST/SUCCESS/ERROR` | `AboutYouSetAForm`        | `message` on error |
| `SIGNUP_SURVEY_COMPLETED`              | `AboutYouSetAForm` submit | —                  |
| `SIGNUP_SURVEY_SKIPPED`                | `AboutYouPage` skip       | —                  |

## Partner access

| Event                                                                          | Fires                                                                 | Key params                         |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------- | ---------------------------------- |
| `ASSIGN_NEW_PARTNER_VIEWED`                                                    | `ApplyACodePage` mount                                                | —                                  |
| `ASSIGN_NEW_PARTNER_ACCESS_REQUEST/SUCCESS/ERROR/INVALID`                      | `ApplyCodeForm`                                                       | `message` on error/invalid         |
| `VALIDATE_ACCESS_CODE_REQUEST/SUCCESS/ERROR/INVALID`                           | `RegisterForm`                                                        | `partner`, `message`               |
| `GET_STARTED_WITH_<PARTNER>_CLICKED`                                           | `generateGetStartedPartnerEvent` — **defined, not currently emitted** | —                                  |
| `PARTNERSHIP_PROMO_<PARTNER>_LOGO_CLICKED`                                     | `RegisterPage` partner logos                                          | —                                  |
| `<PARTNER>_PROMO_GET_STARTED_CLICKED`, `<PARTNER>_PROMO_GO_TO_COURSES_CLICKED` | `WelcomePage` hero CTA                                                | event-user data, `welcome_partner` |

## Navigation

| Event                                                                                                                                                                                                                                           | Fires                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `HEADER_HOME_LOGO_CLICKED`, `HEADER_LOGIN_CLICKED`, `HEADER_ACCOUNT_ICON_CLICKED`, `HEADER_APPLY_A_CODE_CLICKED`, `HEADER_ADMIN_CLICKED`, `HEADER_OUR_BLOOM_TEAM_CLICKED`, `HEADER_IMMEDIATE_HELP_CLICKED`                                      | `TopBar` / `UserMenu` / `DesktopTopNav` (`navigationConfig`) |
| `HEADER_NAVIGATION_MENU_OPENED` / `HEADER_NAVIGATION_MENU_CLOSED`                                                                                                                                                                               | `MobileTopNav`                                               |
| `HEADER_LANGUAGE_MENU_CLICKED`, `HEADER_LANGUAGE_<LOCALE>_CLICKED`                                                                                                                                                                              | `LanguageMenu` (`generateLanguageMenuEvent`)                 |
| `DRAWER_LIBRARY_CLICKED`, `DRAWER_GROUNDING_CLICKED`, `DRAWER_CHAT_CLICKED`, `DRAWER_NOTES_CLICKED`, `DRAWER_THERAPY_CLICKED`, `DRAWER_ADMIN_CLICKED`, `DRAWER_OUR_BLOOM_TEAM_CLICKED`, `DRAWER_IMMEDIATE_HELP_CLICKED`, `DRAWER_LOGIN_CLICKED` | `MobileTopNav` / `MobileBottomNav` (`navigationConfig`)      |
| `SECONDARY_HEADER_LIBRARY_CLICKED`, `SECONDARY_HEADER_GROUNDING_CLICKED`, `SECONDARY_HEADER_CHAT_CLICKED`, `SECONDARY_HEADER_NOTES_CLICKED`, `SECONDARY_HEADER_THERAPY_CLICKED`                                                                 | `DesktopMainNav` / `UserMenu` (`navigationConfig`)           |
| `LEAVE_SITE_BUTTON_CLICKED`                                                                                                                                                                                                                     | `LeaveSiteButton`                                            |
| `NOT_FOUND_VIEWED`                                                                                                                                                                                                                              | `NotFound` (404) mount — `not_found_path`                    |
| `SOCIAL_LINK_CLICKED` / `PARTNER_SOCIAL_LINK_CLICKED`                                                                                                                                                                                           | `Footer` social links — `social_account`                     |
| `MEET_THE_TEAM_VIEWED`                                                                                                                                                                                                                          | `StoryblokMeetTheTeamPage` mount                             |

## Home

All carry event-user data. Card-click and browse-all events come from `useLibrarySectionEvents('home', …)`
and share the cross-surface card params: `card_surface`, `card_section`, `card_item_name`,
`card_item_storyblok_uuid`, `card_item_kind`, `card_item_format`, `card_item_progress`, `card_item_position`.
The card click is `COURSE_CARD_CLICKED` or `RESOURCE_CARD_CLICKED` depending on the card's kind — see
[Card clicks](#card-clicks).

| Event                                           | Fires                              | Key params                                                                                  |
| ----------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------- |
| `HOME_VIEWED`                                   | `HomePage` (after auth)            | `home_logged_in`, `home_in_progress_count`                                                  |
| `HOME_HERO_CTA_CLICKED`                         | hero button                        | `home_hero_cta` (`sessions` \| `courses` \| `join`)                                         |
| `PROMO_GET_STARTED_CLICKED`                     | hero "join" button (signed-out)    | event-user data                                                                             |
| `COURSE_CARD_CLICKED` / `RESOURCE_CARD_CLICKED` | sessions / courses / continue card | `card_surface = home`, `card_section` (`sessions` \| `courses` \| `continue`) + card params |
| `HOME_BROWSE_ALL_CLICKED`                       | section "browse all"               | `card_surface = home`, `card_section`                                                       |
| `HOME_SUPPORT_CARD_CLICKED`                     | `SupportSection` card              | `support_card` (`messaging` \| `notes`)                                                     |
| `HOME_CAROUSEL_PAGED`                           | `CardCarousel` page change         | `carousel_page`, `carousel_pages`                                                           |

## Welcome (partner)

`WELCOME_VIEWED` fires from `WelcomePage`. Card / browse events from `useLibrarySectionEvents('welcome', …)`
carry the same `card_*` params as [Home](#home) with `card_surface = welcome`.

| Event                                           | Fires                      | Key params                                             |
| ----------------------------------------------- | -------------------------- | ------------------------------------------------------ |
| `WELCOME_VIEWED`                                | `WelcomePage` (after auth) | `welcome_partner`, `welcome_logged_in`                 |
| `COURSE_CARD_CLICKED` / `RESOURCE_CARD_CLICKED` | sessions / courses card    | `card_surface = welcome`, `card_section` + card params |
| `WELCOME_BROWSE_ALL_CLICKED`                    | section "browse all"       | `card_surface = welcome`, `card_section`               |
| `WELCOME_SUPPORT_CARD_CLICKED`                  | `SupportSection` card      | `support_card`                                         |
| `WELCOME_CAROUSEL_PAGED`                        | `CardCarousel` page change | `carousel_page`, `carousel_pages`                      |

## Library

All carry event-user data. Filter params report `none` when empty, otherwise a comma-joined list.

| Event                          | Fires                                                                                       | Key params                                                                                                                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `LIBRARY_VIEWED`               | `LibraryPage` (after auth)                                                                  | `library_kind`, `library_themes`, `library_formats`, `library_lengths`, `library_search_active`, `library_logged_in`, `library_results_count`                                                    |
| `LIBRARY_SEARCHED`             | debounced search term                                                                       | `library_search_term_length` (term itself never sent), `library_results_count`                                                                                                                   |
| `LIBRARY_FILTERED`             | one per filter add / remove — a theme card, a format or length checkbox, or the kind toggle | `library_filter_group` (`theme` \| `format` \| `length` \| `kind`), `library_filter_value` (the single value toggled), `library_filter_action` (`add` \| `remove`), `library_results_count`      |
| `LIBRARY_FILTERS_CLEARED`      | clear-filters / clear-all                                                                   | `library_formats`, `library_lengths`, `library_had_search_term`, `library_results_count`                                                                                                         |
| `LIBRARY_LOAD_MORE_CLICKED`    | "load more"                                                                                 | `library_results_count`, `library_visible_count`                                                                                                                                                 |
| `LIBRARY_ITEM_CLICKED`         | a result card                                                                               | `library_item_name`, `library_item_storyblok_uuid`, `library_item_kind`, `library_item_format`, `library_item_themes`, `library_item_progress`, `library_item_position`, `library_results_count` |
| `LIBRARY_SUPPORT_CARD_CLICKED` | `SupportSection` card                                                                       | `support_card`                                                                                                                                                                                   |

## Grounding

| Event                            | Fires                                                                       | Key params                                                                                                                                                                                                                                               |
| -------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GROUNDING_VIEWED`               | `GroundingPage` (after auth)                                                | `grounding_results_count`, `grounding_logged_in`                                                                                                                                                                                                         |
| `GROUNDING_EXERCISE_CLICKED`     | a card → opens the overlay                                                  | `grounding_context` (`grounding_page` \| `resource_moment`), `grounding_exercise_name`, `grounding_exercise_storyblok_uuid`, `grounding_exercise_position`; from the grid also `grounding_results_count`, from a resource page also `resource_*` context |
| `GROUNDING_LOAD_MORE_CLICKED`    | "load more"                                                                 | `grounding_results_count`, `grounding_visible_count`                                                                                                                                                                                                     |
| `GROUNDING_SUPPORT_CARD_CLICKED` | `SupportSection` card                                                       | `support_card`                                                                                                                                                                                                                                           |
| `RESOURCE_GROUNDING_VIEWED`      | `GroundingExerciseDialog` opens                                             | `resource_category` (`grounding`), `resource_name`, `resource_storyblok_uuid`, `grounding_open_method` (`card` \| `deep_link`)                                                                                                                           |
| `RESOURCE_GROUNDING_CLOSED`      | overlay closes or swaps exercise                                            | same payload as `RESOURCE_GROUNDING_VIEWED`                                                                                                                                                                                                              |
| `GROUNDING_EXERCISE_STARTED`     | **backend event log** — embedded audio/video in a grounding exercise starts | `metadata.title`                                                                                                                                                                                                                                         |

## Courses

`eventData` on every course event: `course_name`, `course_storyblok_uuid`, `course_progress`, `course_themes`.

| Event                                                                       | Fires                                                     | Key params                                                                            |
| --------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `COURSE_OVERVIEW_VIEWED`                                                    | `StoryblokCoursePage` (after auth)                        | eventData                                                                             |
| `COURSE_START_CLICKED`                                                      | "begin / continue course" (signed-in)                     | `course_cta_target`                                                                   |
| `SESSION_CARD_CLICKED`                                                      | a session in the list                                     | `card_surface = course`, `session_name`, `session_storyblok_uuid`, `session_position` |
| `COURSE_OTHER_COURSE_CLICKED`                                               | an "other courses" card                                   | `other_course_name`, `other_course_storyblok_uuid`, `other_course_position`           |
| `COURSE_INTRO_VIDEO_STARTED/PLAYED/PAUSED/FINISHED`                         | `CourseIntroduction` `<Video eventPrefix="COURSE_INTRO">` | `video_duration`, position                                                            |
| `COURSE_INTRO_VIDEO_TRANSCRIPT_OPENED/CLOSED` (`COURSE_INTRO_TRANSCRIPT_*`) | intro transcript toggle                                   | eventData, `course_name`                                                              |

## Sessions

`eventData` on every session event: `session_name`, `session_storyblok_uuid`, `session_progress`,
`session_themes`, `course_name`, `course_storyblok_uuid`.

| Event                                                                                                                                                                                           | Fires                                                                 | Key params                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `SESSION_VIEWED`                                                                                                                                                                                | `StoryblokSessionPage` (after auth)                                   | eventData                                                                                                          |
| `SESSION_STARTED_REQUEST/SUCCESS/ERROR`                                                                                                                                                         | first video play or transcript open (`SessionMediaCard`)              | eventData                                                                                                          |
| `SESSION_COMPLETE_REQUEST/SUCCESS/ERROR`                                                                                                                                                        | "mark complete" (`SessionActions`)                                    | `error` on error                                                                                                   |
| `SESSION_VIDEO_STARTED/PLAYED/PAUSED/FINISHED`                                                                                                                                                  | `<Video eventPrefix="SESSION">`                                       | `video_duration`, position                                                                                         |
| `SESSION_VIDEO_TRANSCRIPT_OPENED/CLOSED` (`SESSION_TRANSCRIPT_*`)                                                                                                                               | transcript toggle                                                     | eventData                                                                                                          |
| `SESSION_VIDEO_EXPANDED/COLLAPSED`, `SESSION_ACTIVITY_EXPANDED/COLLAPSED`, `SESSION_BONUS_CONTENT_EXPANDED/COLLAPSED`, `SESSION_CHAT_EXPANDED/COLLAPSED`, `SESSION_FEEDBACK_EXPANDED/COLLAPSED` | `SessionContentCard` toggle (`${eventPrefix}_${EXPANDED\|COLLAPSED}`) | eventData                                                                                                          |
| `SESSION_CHAT_VIDEO_VIDEO_STARTED/…`                                                                                                                                                            | `<Video eventPrefix="SESSION_CHAT_VIDEO">` in `SessionChat`           | `video_duration`                                                                                                   |
| `SESSION_CHAT_BUTTON_CLICKED`                                                                                                                                                                   | "go to chat" button                                                   | eventData                                                                                                          |
| `SESSION_PLAYLIST_OPENED`                                                                                                                                                                       | mobile playlist opened                                                | eventData                                                                                                          |
| `SESSION_CARD_CLICKED`                                                                                                                                                                          | a session in the playlist                                             | `card_surface = playlist`, `selected_session_name`, `selected_session_storyblok_uuid`, `selected_session_position` |
| `SESSION_NEXT_CLICKED`                                                                                                                                                                          | "next session" (`SessionActions`)                                     | next-session details                                                                                               |
| `SESSION_FEEDBACK_SUBMITTED`                                                                                                                                                                    | `SessionFeedbackForm` submit                                          | eventData, `feedback_tag`, `feedbackTags` (legacy key)                                                             |

## Resources — video, audio, written, activity

Every resource type gets its **own** event family, one per content type — **`RESOURCE_VIDEO_*`,
`RESOURCE_AUDIO_*`, `RESOURCE_WRITTEN_*`, `RESOURCE_ACTIVITY_*`** — plus `RESOURCE_GROUNDING_*` for the
overlay (see [Grounding](#grounding)). They are **not** merged: each is a distinct prefix with its own
`resource_category` value (`video` / `audio` / `written` / `activity`).

The family is selected by an `eventPrefix` string. `eventData` on every event:
`resource_category`, `resource_name`, `resource_storyblok_uuid`, `resource_progress`, `resource_themes`.

| Event (per family prefix)                        | Fires                                                                                                   | Key params                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `${PREFIX}_VIEWED`                               | page mount, after auth (`useStoryblokResourcePage`)                                                     | eventData                                                               |
| `${PREFIX}_STARTED_REQUEST/SUCCESS/ERROR`        | first engagement — media play, transcript open, or (written/activity) page open (`useResourceProgress`) | eventData                                                               |
| `${PREFIX}_COMPLETE_REQUEST/SUCCESS/ERROR`       | media finished or "mark complete" pressed                                                               | eventData + `resource_completion_method` (`media_complete` \| `manual`) |
| `${PREFIX}_VIDEO_STARTED/PLAYED/PAUSED/FINISHED` | `<Video>` — `RESOURCE_VIDEO` only                                                                       | `video_duration`, `video_current_time`, `video_current_percentage`      |
| `${PREFIX}_AUDIO_STARTED/PLAYED/PAUSED/FINISHED` | `ResourceAudioPlayer` — `RESOURCE_AUDIO` only                                                           | `audio_duration`, `audio_current_time`, `audio_current_percentage`      |
| `${PREFIX}_TRANSCRIPT_OPENED/CLOSED`             | transcript toggle (`ResourcePageLayout`) — video / audio only                                           | eventData                                                               |
| `${PREFIX}_VISIT_SESSION`                        | "watch the full session" link                                                                           | eventData, `related_session_name`, `related_session_href`               |
| `RESOURCE_FEEDBACK_VIEWED`                       | feedback dialog opens (after "mark complete")                                                           | eventData, `category`                                                   |
| `RESOURCE_FEEDBACK_DISMISSED`                    | dialog closed without submitting                                                                        | eventData, `category`                                                   |
| `RESOURCE_FEEDBACK_SUBMITTED`                    | feedback submitted                                                                                      | eventData, `feedback_tag`, `category` + `feedbackTags` (legacy keys)    |

The media sub-events carry the media word twice — `RESOURCE_VIDEO_VIDEO_STARTED`,
`RESOURCE_AUDIO_AUDIO_STARTED` — because the family prefix (`RESOURCE_VIDEO`) and the player component
suffix (`_VIDEO_STARTED` from `<Video>`) are both present. This is the intended, consistent form.
`RESOURCE_WRITTEN` / `RESOURCE_ACTIVITY` have no media sub-events (text content).

## Card clicks

A content card selected on a browse or related-content surface. The event is named by the card's
**type**, not the surface — the surface rides in `card_surface`:

| Event                            | Card type                              | Surfaces (`card_surface`)                                      |
| -------------------------------- | -------------------------------------- | -------------------------------------------------------------- |
| `COURSE_CARD_CLICKED`            | a course                               | `home`, `welcome`                                              |
| `RESOURCE_CARD_CLICKED`          | a single session                       | `home`, `welcome`                                              |
| `SESSION_CARD_CLICKED`           | a course session                       | `course` (overview list), `playlist`                           |
| `RELATED_RESOURCES_CARD_CLICKED` | a single session in a related carousel | see [Related content & carousels](#related-content--carousels) |

Home / welcome cards also carry `card_section` (`sessions` \| `courses` \| `continue`) and the
`card_item_*` params (`name`, `storyblok_uuid`, `kind`, `format`, `progress`, `position`). Course /
playlist session cards carry `session_*` / `selected_session_*` params instead (see
[Courses](#courses) / [Sessions](#sessions)).

## Related content & carousels

The related-**resources** carousel (`StoryblokRelatedContent` at the bottom of a resource page,
`ResourceCarousel` on course / session / welcome pages) and the related-**grounding** carousel
(`ResourceGroundingSection` "moment") stay distinct so each can be reported on its own.

| Event                              | Fires                                                                                                                                 | Key params                                                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `RELATED_RESOURCES_CARD_CLICKED`   | a card in `StoryblokRelatedContent` or `ResourceCarousel`                                                                             | `related_resource_name`, `related_resource_storyblok_uuid`, `related_resource_category`, `related_resource_position` |
| `RELATED_RESOURCES_CAROUSEL_PAGED` | `StoryblokRelatedContent` / `ResourceCarousel` carousel                                                                               | `carousel_page`, `carousel_pages`                                                                                    |
| `RELATED_GROUNDING_CAROUSEL_PAGED` | `ResourceGroundingSection` carousel (grounding card click is `GROUNDING_EXERCISE_CLICKED` with `grounding_context = resource_moment`) | `carousel_page`, `carousel_pages`                                                                                    |
| `STORYBLOK_CAROUSEL_PAGED`         | `StoryblokCarousel`                                                                                                                   | `carousel_page`, `carousel_pages`                                                                                    |
| `STORYBLOK_LINK_CARD_CLICKED`      | `StoryblokLinkCard`                                                                                                                   | `link_card_name`                                                                                                     |

## Sign-up unlock prompts

| Event                                 | Fires                                                                                                                                           | Key params                                                                                                                                                                                        |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SIGN_UP_UNLOCK_BUTTON_CLICKED`       | the `SignUpCard` "sign up" button (gated course / session / resource for a signed-out visitor)                                                  | `sign_up_source` (`course` \| `session` \| `resource` \| `related_session`), `sign_up_prompt_placement` (`media` \| `page`), `unlock_item_type`, `unlock_item_name`, `unlock_item_storyblok_uuid` |
| `SIGN_UP_UNLOCK_LOGIN_CLICKED`        | the card's "log in" link                                                                                                                        | same                                                                                                                                                                                              |
| `SIGN_UP_TODAY_BANNER_BUTTON_CLICKED` | `SignUpSection` CTA (name kept from the removed `SignUpBanner`)                                                                                 | `sign_up_section_source`                                                                                                                                                                          |
| `SIGN_UP_HERO_BUTTON_CLICKED`         | `SignUpButton` — page-header CTA for signed-out visitors on library / grounding / messaging / partially-public content pages; links to register | `sign_up_section_source`                                                                                                                                                                          |

The sign-up section and card have no `*_VIEWED` events — page views cover "saw the prompt".

## Messaging

| Event                   | Fires                                           | Key params                         |
| ----------------------- | ----------------------------------------------- | ---------------------------------- |
| `MESSAGING_VIEWED`      | `MessagingPage` (after auth)                    | `messaging_logged_in`              |
| `CHAT_VIEWED`           | `MessageThread` mounts (open thread, signed-in) | —                                  |
| `CHAT_MESSAGE_COMPOSED` | user starts composing                           | —                                  |
| `CHAT_MESSAGE_SENT`     | message sent (`useMessaging`)                   | `kind` (`text` \| attachment kind) |
| `CHAT_MESSAGE_RECEIVED` | message received                                | `kind`                             |

## Therapy

| Event                                                                             | Fires                                                                                                                     | Key params           |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `THERAPY_BOOKING_VIEWED`                                                          | `BookTherapyPage` mount                                                                                                   | —                    |
| `THERAPY_BOOKING_OPENED`                                                          | Simplybook widget opened                                                                                                  | —                    |
| `THERAPY_BOOKINGS_VIEWED`                                                         | `TherapyBookings` list                                                                                                    | `count`              |
| `THERAPY_BOOKINGS_LOAD_ERROR`                                                     | list load failed                                                                                                          | `error`              |
| `THERAPY_BOOKING_EXPANDED` / `THERAPY_BOOKING_COLLAPSED`                          | a booking row toggled                                                                                                     | `sessionId`          |
| `THERAPY_BOOKING_CANCEL_DIALOG_OPENED` / `_CLOSED`                                | cancel dialog                                                                                                             | `sessionId`          |
| `THERAPY_BOOKING_CANCEL_CONFIRMED`                                                | cancel confirmed                                                                                                          | `sessionId`          |
| `THERAPY_BOOKING_CANCELLED` / `THERAPY_BOOKING_CANCELLED_ERROR`                   | cancel API result                                                                                                         | `sessionId`, `error` |
| `THERAPY_CONFIRMATION_VIEWED`, `THERAPY_FAQ_OPENED`, `THERAPY_VIDEO_LINK_CLICKED` | **defined, not currently emitted** (booking confirmation is inside the Simplybook iframe; the video link renders as text) | —                    |

## Notes / WhatsApp

| Event                                        | Fires                                         | Key params                                                                           |
| -------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------ |
| `NOTES_VIEWED`                               | `NotesPage` (`/subscription/whatsapp`) mount  | `notes_logged_in` (not auth-gated — see [How events are sent](#how-events-are-sent)) |
| `NOTES_FROM_BLOOM_PROMO_CLICKED`             | `NotesFromBloomPromo` banner CTA              | event-user data                                                                      |
| `WHATSAPP_SUBSCRIBE_REQUEST/SUCCESS/ERROR`   | `WhatsappSubscribeForm` / `RegisterNotesForm` | `message` on error                                                                   |
| `WHATSAPP_UNSUBSCRIBE_REQUEST/SUCCESS/ERROR` | `WhatsappUnsubscribeForm`                     | `message` on error                                                                   |

## Account & settings

| Event                                                                                      | Fires                                                                              | Key params                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SETTINGS_VIEWED`                                                                          | `SettingsPage` mount                                                               | — (no event-user data, unlike other authed page views)                                                                                                                     |
| `DELETE_ACCOUNT_REQUEST` / `DELETE_ACCOUNT_SUCCESS` / `DELETE_ACCOUNT_ERROR`               | `AccountActionsCard.deleteAccountConfirmHandler` — `deleteUser` mutation lifecycle | — (no params; `_ERROR` carries no `message`, no event-user data on any). `_SUCCESS` is followed by a Firebase `signOut`, so `LOGOUT` / `LOGGED_OUT` fire via `useLoadUser` |
| `EMAIL_REMINDERS_SET_REQUEST/SUCCESS/ERROR`, `EMAIL_REMINDERS_UNSET_REQUEST/SUCCESS/ERROR` | `EmailRemindersSettingsForm`                                                       | event-user data                                                                                                                                                            |
| `USER_DISABLED_SERVICE_EMAILS`                                                             | `DisableServiceEmailsPage`                                                         | —                                                                                                                                                                          |

## Admin

| Event                                                       | Fires                                  |
| ----------------------------------------------------------- | -------------------------------------- |
| `ADMIN_DASHBOARD_VIEWED`                                    | `AdminDashboardPage` mount             |
| `CREATE_PARTNER_ACCESS_REQUEST/SUCCESS/ERROR`               | `CreateAccessCodeForm`                 |
| `UPDATE_PARTNER_ACTIVE_REQUEST/SUCCESS/ERROR`               | `UpdatePartnerActiveForm` — `active`   |
| `UPDATE_THERAPY_SESSIONS` / `UPDATE_THERAPY_SESSIONS_ERROR` | `UpdateTherapyAdminForm`               |
| `UPDATE_PARTNER_ADMIN` / `UPDATE_PARTNER_ADMIN_ERROR`       | `UpdatePartnerAdminForm`               |
| `CREATE_PARTNER_ADMIN_REQUEST/SUCCESS/ERROR`                | `CreatePartnerAdminForm` (super admin) |

## Banners

| Event                                                                                       | Fires                                                 | Key params   |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------ |
| `REDESIGN_BANNER_VIEWED` / `REDESIGN_BANNER_DISMISSED` / `REDESIGN_BANNER_FEEDBACK_CLICKED` | `RedesignNewsBanner`                                  | —            |
| `USER_BANNER_VIEWED` / `USER_BANNER_INTERESTED` / `USER_BANNER_DISMISSED`                   | `UserResearchBanner`                                  | —            |
| `FRUITZ_RETIREMENT_BANNER_DISMISSED`                                                        | `FruitzRetirementBanner`                              | —            |
| `PWA_DESKTOP_BANNER_VIEWED`                                                                 | `DesktopPwaBanner`                                    | pwa metadata |
| `SIGN_UP_TODAY_BANNER_BUTTON_CLICKED`                                                       | see [Sign-up unlock prompts](#sign-up-unlock-prompts) |              |

## Cookies & consent

| Event                                   | Fires                                                      |
| --------------------------------------- | ---------------------------------------------------------- |
| `COOKIES_ACCEPTED` / `COOKIES_REJECTED` | `CookieBanner` (also sends a `gtag('consent','update',…)`) |

## PWA

| Event                                                                                                       | Fires                                  |
| ----------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `PWA_LOADED` / `WEB_APP_LOADED`                                                                             | `app/layout` on load, by install state |
| `PWA_DESKTOP_BANNER_VIEWED`, `PWA_INSTALL_CLICKED`, `PWA_DISMISS_CLICKED`, `PWA_INSTALLED`, `PWA_DISMISSED` | `usePwa` / `DesktopPwaBanner`          |

## Storyblok generic components

| Event                                                                 | Fires                                                                | Key params       |
| --------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------- |
| `STORYBLOK_BUTTON_<TEXT>_CLICKED`                                     | `StoryblokButton` / common `Button` (`generateStoryblokButtonEvent`) | event-user data  |
| `ACCORDION_OPENED` + `ACCORDION_<TITLE>`                              | `StoryblokAccordion`                                                 | `accordionTitle` |
| `FAQ_OPENED`                                                          | **defined, not currently emitted**                                   | —                |
| `STORYBLOK_VIDEO_STARTED/…`, `STORYBLOK_AUDIO_PLAYER_AUDIO_STARTED/…` | `StoryblokVideo` / `StoryblokAudio` (`eventPrefix`)                  | media position   |

## Feedback

See [Sessions](#sessions) and [Resources](#resources--video-audio-written-activity).

## Backend event log

Written via `createEventLog` to bloom-backend (not GA). Names in `EVENT_LOG_NAME`.

| Event                        | Fires                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| `LOGGED_IN`                  | `LoginForm` on successful login                                                        |
| `LOGGED_OUT`                 | `useLoadUser` on logout                                                                |
| `GROUNDING_EXERCISE_STARTED` | `Video` / `StoryblokAudio` when media on a `/grounding` path starts — `metadata.title` |
