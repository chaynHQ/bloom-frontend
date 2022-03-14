# Bloom

Bloom is a remote trauma support service from Chayn, a global charity supporting survivors of abuse across borders. Bloom is our flagship product; a free, web-based support service designed for anyone who has experienced or is currently experiencing domestic or sexual abuse. Through a combination of online video-based courses, anonymous interaction and 1:1 chat, Bloom aims to provide tailored information, guidance, everyday tools, and comforting words to cope with traumatic events.

## Get involved

Bloom is created by Chayn, global nonprofit, run by survivors and allies from around the world, creating resources to support the healing of survivors of gender-based violence. There are lots of ways to get involved, from joining our volunteer team to [donating](https://www.paypal.me/chaynhq) or supporting us on social media.

Website - [Chayn](https://www.chayn.co/)

Twitter - [@ChaynHQ](https://twitter.com/ChaynHQ)

Instagram - [@chaynhq](https://www.instagram.com/chaynhq/)

Youtube - [Chayn Team](https://www.youtube.com/channel/UC5_1Ci2SWVjmbeH8_USm-Bg)

# Bloom Frontend

[![Bloom CI Pipeline](https://github.com/chaynHQ/bloom-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/chaynHQ/bloom-frontend/actions/workflows/ci.yml)

**Currently in active development**

## Technologies used

- [React](https://reactjs.org/) - JavaScript library for building component based user interfaces
- [Next.js](https://nextjs.org/) - React framework for hybrid static & server rendering, file-system routing and more
- [Typescript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [Redux Toolkit](https://redux-toolkit.js.org/) - Opinionated Redux package for state management
- [Firebase](https://firebase.google.com/docs/auth) - User authentication and analytics
- [Material UI / MUI](https://mui.com/) - React UI library for prebuilt components
- [Storyblok](https://www.storyblok.com/) - Headless CMS for pages and courses content
- [Simplybook](https://simplybook.me/en/) - Appointment booking system used for therapy
- [Crisp](https://crisp.chat/en/) - User messaging
- [Rollbar](https://rollbar.com/) - Error reporting
- [Heroku](https://heroku.com/) - Build, deploy and operate staging and production apps
- [GitHub Actions](https://github.com/features/actions) - CI pipeline

See [integrations](##Integrations) for more details

## Local development

### Prerequisites

- NodeJS v12.x
- Yarn v1.x

### Run local backend

See [bloom-backend](https://github.com/chaynHQ/bloom-backend) for instructions

### Install dependencies

```bash
yarn
```

### Create .env.local file

Include the following environment variables in a .env.local file

```bash
NEXT_PUBLIC_ENV=local
NEXT_PUBLIC_API_URL=http://localhost:35001/api/v1/
NEXT_PUBLIC_BASE_URL=http://localhost:3000

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

NEXT_PUBLIC_SIMPLYBOOK_WIDGET_URL=
NEXT_PUBLIC_CRISP_WEBSITE_ID=
NEXT_PUBLIC_STORYBLOK_PREVIEW_TOKEN=
NEXT_PUBLIC_HOTJAR_ID=
```

**When adding a new environment variable, it may also need to be added to github secrets and the [ci.yml](ci.yml) file**

### Run locally

Start the app in development mode (with hot-code reloading, error reporting, etc.):

```bash
yarn dev
```

Go to [http://localhost:3000](http://localhost:3000)

### Run unit tests

```bash
yarn test:unit
```

To have your unit tests running in the background as you change code:

```bash
yarn test:unit:watch
```

### Formatting and linting

```bash
yarn lint
```

To lint and fix:

```bash
yarn lint:fix
```

Formatting and linting is provided by ESLint and Prettier (see the relevant configs for details).

Workspace settings for VSCode are included for consistent linting and formatting.

### Build the app for production

For testing the production build. This will be run automatically during deployments.

```bash
yarn build
```

## Key concepts

### Public Bloom

Anyone can come directly to the site and register as a _public_ Bloom user with access to selected courses. Self guided/static courses can be completed at any time by a public user, without any extra features e.g. therapy or permanent 1-1 chat. Public Bloom also offers _live_ courses, whereby for a period of time, users also have access to 1-1 crisp chat and the option to join a whatsapp/telegram group for regular messages related to the live course.

### Partner access and multi tenancy

Alongside _public_ Bloom, we also have `Partners` (e.g. Bumble) which offer their users a Bloom `PartnerAccess` with additional features to public Bloom. The additional features include therapy, 1-1 chat and extra courses. A `PartnerAccess` is created by a `PartnerAdmin` and has a unique code for the user to apply when registering for an account, or afterwards on the `/apply-code` page. See [database schemas](https://github.com/chaynHQ/bloom-backend#database-models) for more details.

A user can have 0 (public) or many partners and the app dynamically handles this. Partner branding and tags are applied across the app (e.g. in the footer) and some pages are custom to the partner e.g. [welcome/[partnerName].tsx](pages/welcome/[partnerName].tsx).

### Features

**Bloom courses** include a series of sessions with steps for the user to complete, i.e. watch a video, complete an activity, optional bonus content. The sessions can be marked as complete by the user. Courses available are dependent on the user's partners and their selected courses.

**Bloom therapy** is available to some users dependent on their partner access, with a number of therapy sessions available to book via the integrated Simplybook booking widget. Therapy is offered in multiple languages and currently users can select their preferred language and therapist. Webhooks are triggered by zapier when a booking is created/cancelled, to update the user's available therapy sessions remaining in the database.

**Bloom 1-1 chat** is available to some users dependent on their partner access, sending Crisp messages to the Bloom team in relation to course content or other questions and support. The Crisp widget is embedded in session pages and users with 1-1 chat will have a profile in Crisp which reflects key data and events, sent by the bloom-backend api.

### User types

There are several user types with different features enabled - [guards](guards) are used to check and block access to pages based on the user data in state.

**User** - a standard user for the features mentioned above. A user can be a _public_ user only OR have partner access(es) with extra features enabled by different partners.

**Partner admin user** - a partner team member who uses the app to complete Bloom admin tasks such as creating new partner access codes. Partner admin pages are under `/partner-admin` and act as a sub site.

### State management - Redux Toolkit

RTK is used to store state, mostly related to the user and populated by backend api calls. The `user/me` endpoint populates the `User`, `Courses`, `PartnerAccess` and `ParterAdmin` state on login or app refresh, to be used across the app to manage access and features displayed. State is also updated following actions/apis calls - we use [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) to fetch and cache data into state, see `app/api.ts`. The state slices generally copy the [database schemas](https://github.com/chaynHQ/bloom-backend#database-models). Note the `Courses` slice does not act as a cache for storing retrieved storyblok courses, instead it stores the user's courses progress, i.e. the backend `CourseUser` table.

### Internationalisation

Multiple languages are supported across the app. For static text, all strings are wrapped and translated using [next-intl](https://github.com/amannn/next-intl). For CMS Storyblok content, each field in a story or bloks is translatable and is returned based on the requested locale. Next.js supports i18n routing and Storyblok has an extension to support translated routes, however this is not currently used.

Integrations are chosen with internationalisation as a priority, with Crisp and Simplybook supporting multiple timezones and languages.

### Storyblok CMS

Content is delivered by [Storyblok](https://www.storyblok.com/), a headless CMS that allows the team to edit and preview content as it would appear in the app, before publishing changes. . Stricter pages such as Course and Session pages, or pages with a mix of custom functionality and changing content, are handled in custom pages and components e.g. [/courses/[slug].tsx](pages/courses/[slug].tsx).

**Courses structure**

The storyblok courses folder/page structure was based around url paths and the need for weeks/sessions to be nested inside a course. The pattern is Courses (folder) -> Course name (folder) -> Course overview (root page) + Session (pages). This allows us to group and order sessions under the relevant course, with the url path `courses/course-name/session-name`. The order of pages in Storyblok matters as it's used to order sessions within a week.

Course and Session are Storyblok _content types_ with defined schemas that can then be processed in the custom pages, e.g. `story.content.field_name`. Course includes a `weeks` field that links/relates to the sessions in each week of the course. Session includes a `Course` field that links/relates back to the course - it's not ideal to include this field but it makes it easy to load the course data with the session directly. The middle `weeks` relationship between Courses and Sessions added some complexity that discouraged Storyblok's recommended patterns, e.g. having Courses and Sessions as top level folders, rather than nesting folders that contain several content types.

**Dynamic components**

Storyblok components allow the team to add richtext, images, videos, page sections, rows etc, using our custom schemas that include fields for styles e.g. the alignment or color of the content. These Storyblok components are then then mapped to our React components, e.g. [StoryblokRow.tsx](components/storyblok/StoryblokRow.tsx) [StoryblokImage.tsx](components/Storyblok/StoryblokImage.tsx), either in a custom page where we expect the field/component, or a dynamic page.

**Dynamic pages**

Dynamic pages allow the team to create new content pages in Storyblok e.g. `/about-topic`, without requiring developer work. Our top level dynamic route [[slug].tsx](pages/[slug].tsx) and [DynamicComponent.tsx](components/DynamicComponent.tsx) render the components on the page.

## Git flow and deployment

Create new branches from the `develop` base branch. There is no need to run the build command before pushing changes to GitHub, simply push and create a pull request for the new branch. GitHub Actions will run build and linting tasks automatically. Squash and merge feature/bug branches into `develop`.

When changes are ready to be deployed to staging, merge `develop` into `staging`. This will trigger an automatic deployment to the production app by Heroku.

When changes have been tested in staging, merge `staging` into `main`. This will trigger an automatic deployment to the production app by Heroku.

**New environment variables must be added to Heroku before release.**

## License

Bloom and all of Chayn's projects are open source.
The core tech stack included here is open source however some external integrations used in the project require subscriptions.
