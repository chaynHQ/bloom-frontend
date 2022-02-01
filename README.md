# Bloom

Bloom is a remote trauma support service from Chayn, a global charity supporting survivors of abuse across borders. Bloom informs and empowers survivors by offering courses that combine important information about trauma and gender-based violence with therapeutic practices to help heal from trauma

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
NEXT_PUBLIC_PILOT_COURSES_PASSWORD=
NEXT_PUBLIC_STORYBLOK_PREVIEW_TOKEN=
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

### Partner access and multi tenancy

Bloom as a service has `Partners` which offer their users a Bloom `PartnerAccess` with additional features.

A user can have 0 or many partners and the app dynamically handles this. Partner branding and tags are applied across the app and some pages are custom to the partner e.g. `/welcome/[partnerName]`.

### Features

**Bloom courses** include a series of sessions with steps for the user to complete (watch video, complete activity, optional bonus content). The sessions can be marked as complete by the user. Courses available are dependent on the user's partners and their selected courses.

**Bloom therapy** is available to some users dependent on their partner access, with a number of therapy sessions available to book via the integrated Simplybook booking widget. Therapy is offered in multiple languages and currently users can select their preferred language and therapist. Webhooks are triggered by zapier when a booking is created/cancelled, to update the user's available therapy sessions remaining in the database.

**Bloom live chat** is available to some users dependent on their partner access, sending Crisp messages to the Bloom team in relation to course content or other questions and support. The Crisp widget is embedded in session pages and users with live chat will have a profile in Crisp which reflects key data and events, sent by the bloom-backend api.

### User types

A **User** is someone who uses the app for the features mentioned above. A user can have 0 or many partner access records with different features enabled by different partners.

A **Partner admin user** is a team member of a partner who uses the app to complete Bloom admin tasks such as creating a new partner access code. Partner admin pages are under `/partner-admin` and act as a sub site.

### Internationalisation

Multiple languages are supported across the app. For static text, all strings are wrapped and translated using [next-intl](https://github.com/amannn/next-intl). For CMS Storyblok content, each field in a story or bloks is translatable and is returned based on the requested locale. Next.js supports i18n routing and Storyblok has an extension to support translated routes, however this is not currently used.

Integrations are chosen with internationalisation as a priority, with Crisp and Simplybook supporting multiple timezones and languages.

### Storyblok CMS

Content is delivered by Storyblok, a headless CMS that allows the team to edit and preview content as it would appear in the app, before publishing changes. Dynamic component based pages can be created for info pages e.g. `/about`, which are handled by our [DynamicComponent.tsx](components/DynamicComponent.tsx). Stricter pages such as Course and Session pages, or pages with a mix of custom functionality and changing content, are handled in custom pages e.g. [/courses/[slug].tsx](pages//courses/[slug].tsx). Courses and Sessions are Storyblok Content Types with defined schemas that can then be processed in the custom pages.

## Git flow and deployment

Create new branches from the `develop` base branch. There is no need to run the build command before pushing changes to GitHub, simply push and create a pull request for the new branch. GitHub Actions will run build and linting tasks automatically. Squash and merge feature/bug branches into `develop`.

When changes are ready to be deployed to staging, merge `develop` into `staging`. This will trigger an automatic deployment to the production app by Heroku.

When changes have been tested in staging, merge `staging` into `main`. This will trigger an automatic deployment to the production app by Heroku.

**New environment variables must be added to Heroku before release.**

## License

Bloom and all of Chayn's projects are open source.
The core tech stack included here is open source however some external integrations used in the project require subscriptions.
