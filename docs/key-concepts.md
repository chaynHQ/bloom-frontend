## Key concepts

### Public Bloom

Anyone can come directly to the site and register as a _public_ Bloom user with access to selected courses. Self guided/static courses can be completed at any time by a public user, without any extra features e.g. therapy.

### Partner access and multi tenancy

Alongside _public_ Bloom, we also have `Partners` (e.g. Bumble) which offer their users a Bloom `PartnerAccess` with additional features to public Bloom. The additional features include therapy, 1-1 chat and extra courses. A `PartnerAccess` is created by a `PartnerAdmin` and has a unique code for the user to apply when registering for an account, or afterwards on the `/apply-code` page. See [database schemas](https://github.com/chaynHQ/bloom-backend#database-models) for more details.

A user can have 0 (public) or many partners and the app dynamically handles this. Partner branding and tags are applied across the app (e.g. in the footer) and some pages are custom to the partner e.g. [welcome/[partnerName].tsx](pages/welcome/[partnerName].tsx).

### Features

**Bloom courses** include a series of sessions with steps for the user to complete, i.e. watch a video, complete an activity, optional bonus content. The sessions can be marked as complete by the user. Courses available are dependent on the user's partners and their selected courses.

**Bloom therapy** is available to some users dependent on their partner access, with a number of therapy sessions available to book via the integrated Simplybook booking widget. Therapy is offered in multiple languages and currently users can select their preferred language and therapist. Webhooks are triggered by zapier when a booking is created/cancelled, to update the user's available therapy sessions remaining in the database.

**Bloom 1-1 chat** is currently available to all users. Users can send Crisp messages to the Bloom team in relation to course content or other questions and support. The Crisp widget is embedded in session pages and users with 1-1 chat will have a profile in Crisp which reflects key data and events, sent by the bloom-backend api.

**Notes from Bloom** is currently available all users. Users can sign up for whatsapp messages twice a week. Message content can range from affirmational quotes, videos or snapshot of course content. Respond.io is used to hold contact information and to schedule messages. Contact information is also held in the database. As there was not the budget to use the Respond.io plan which allows for a direct integration, a Zapier workaround is used where bloom backend triggers a Zapier webhook which will then add / delete a contact from respond.io.

### User types

There are several user types with different features enabled - [guards](guards) are used to check and block access to pages based on the user data in state.

**User** - a standard user for the features mentioned above. A user can be a _public_ user only OR have partner access(es) with extra features enabled by different partners.

**Partner admin user** - a partner team member who uses the app to complete Bloom admin tasks such as creating new partner access codes. Partner admin pages are under `/partner-admin` and act as a sub site.

**Super admin user** - this is a chayn user who can create partner admins. Super admins can view this dashboard via `admin/dashboard`.

### State management - Redux Toolkit

RTK is used to store state, mostly related to the user and populated by backend api calls. The `user/me` endpoint populates the `User`, `Courses`, `PartnerAccess` and `ParterAdmin` state on login or app refresh, to be used across the app to manage access and features displayed. State is also updated following actions/apis calls - we use [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) to fetch and cache data into state, see `app/api.ts`. The state slices generally copy the [database schemas](https://github.com/chaynHQ/bloom-backend#database-models). Note the `Courses` slice does not act as a cache for storing retrieved storyblok courses, instead it stores the user's courses progress, i.e. the backend `CourseUser` table.

### Internationalisation

Multiple languages are supported across the app. For static text, all strings are wrapped and translated using [next-intl](https://github.com/amannn/next-intl). For CMS Storyblok content, each field in a story or bloks is translatable and is returned based on the requested locale. Next.js supports i18n routing and Storyblok has an extension to support translated routes, however this is not currently used.

Integrations are chosen with internationalisation as a priority, with Crisp and Simplybook supporting multiple timezones and languages.

### Storyblok CMS

Content is delivered by [Storyblok](https://www.storyblok.com/), a headless CMS that allows the team to edit and preview content as it would appear in the app, before publishing changes. Some pages are fully flexible, using [pages/[slug].tsx](/pages/[slug].tsx) to dynamically render components. Stricter pages such as Course and Session pages, or pages with a mix of custom functionality and changing content, are handled in custom pages and components e.g. [/courses/[slug].tsx](pages/courses/[slug].tsx).

**Courses structure**

The storyblok courses folder/page structure was based around url paths and the need for weeks/sessions to be nested inside a course. The pattern is Courses (folder) -> Course name (folder) -> Course overview (root page) + Session (pages). This allows us to group and order sessions under the relevant course, with the url path `courses/course-name/session-name`. The order of pages in Storyblok matters as it's used to order sessions within a week.

Course and Session are Storyblok _content types_ with defined schemas that can then be processed in the custom pages, e.g. `story.content.field_name`. Course includes a `weeks` field that links/relates to the sessions in each week of the course. Session includes a `Course` field that links/relates back to the course - it's not ideal to include this field but it makes it easy to load the course data with the session directly. The middle `weeks` relationship between Courses and Sessions added some complexity that discouraged Storyblok's recommended patterns, e.g. having Courses and Sessions as top level folders, rather than nesting folders that contain several content types.

The image based abuse course has its own specific course and session page as this course required a different structure with multiple bonus content blocks.

**Dynamic components**

Storyblok components allow the team to add richtext, images, videos, page sections, rows etc, using our custom schemas that include fields for styles e.g. the alignment or color of the content. These Storyblok components are then then mapped to our React components, e.g. [StoryblokRow.tsx](components/storyblok/StoryblokRow.tsx) [StoryblokImage.tsx](components/Storyblok/StoryblokImage.tsx), either in a custom page where we expect the field/component, or a dynamic page.

**Dynamic pages**

Dynamic pages allow the team to create new content pages in Storyblok e.g. `/about-topic`, without requiring developer work*. Our top level dynamic route [[slug].tsx](pages/[slug].tsx) allows new pages to be added, with an infinite number of [StoryblokPageSection.tsx](components/storyblok/StoryblokPageSection.tsx) with nested components. [DynamicComponent.tsx](components/storyblok/DynamicComponent.tsx) can also be used to dynamically render components on a page, where the storyblok field is of type `blocks` and we don't know which blocks to expect.
*Note: If a page is to be public/unauthenticated, it must be added to `publicPaths` in [\_app.tsx](pages/_app.tsx).