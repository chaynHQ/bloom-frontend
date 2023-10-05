# Bloom

Bloom is a remote trauma support service from Chayn, a global charity supporting survivors of abuse across borders. Bloom is our flagship product; a free, web-based support service designed for anyone who has experienced or is currently experiencing domestic or sexual abuse. Through a combination of online video-based courses, anonymous interaction and 1:1 chat, Bloom aims to provide tailored information, guidance, everyday tools, and comforting words to cope with traumatic events. 💖

## Get involved

If you would like to help Bloom and receive special access to our organization and volunteer opportunities, please get in touch with us to express your interest in volunteering via [this form](https://forms.gle/qXfDdPgJxYwvMmVP7). We'll get back to you to schedule an onboarding call. Other ways to get involved and support us are [donating](https://www.paypal.me/chaynhq), making an open-source contribution here on GitHub, and supporting us on social media! 

Our social medias:

Website - [Chayn](https://www.chayn.co/)

Twitter - [@ChaynHQ](https://twitter.com/ChaynHQ)

Instagram - [@chaynhq](https://www.instagram.com/chaynhq/)

Youtube - [Chayn Team](https://www.youtube.com/channel/UC5_1Ci2SWVjmbeH8_USm-Bg)

LinkedIn - [@chayn](https://www.linkedin.com/company/chayn)

# Bloom Frontend

[For a more detailed explanation of this project's key concepts and architecture, please visit the /docs directory](https://github.com/chaynHQ/bloom-frontend/tree/develop/docs)

[![Bloom CI Pipeline](https://github.com/chaynHQ/bloom-frontend/actions/workflows/deploy-to-staging.yml/badge.svg)](https://github.com/chaynHQ/bloom-frontend/actions/workflows/deploy-to-staging.yml)

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

## Local development

To make a contribution, please read our Contributing Guidelines in [CONTRIBUTING.md](/CONTRIBUTING.md)

### Prerequisites

- NodeJS v16.x
- Yarn v1.x

### Run local backend

See [bloom-backend](https://github.com/chaynHQ/bloom-backend) for instructions

### Install dependencies

```bash
yarn
```

### Create .env.local file

Include the following environment variables in a .env.local file.

You will need to gather the following tokens from [Firebase](https://firebase.google.com/docs/auth), [Simplybook](https://simplybook.me/en/), [Crisp](https://crisp.chat/en/), and [Storyblok](https://www.storyblok.com/).
If you're a volunteer loading up the front-end, please get in touch with the team for access the environment variables.

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
NEXT_PUBLIC_STORYBLOK_TOKEN=

NEXT_PUBLIC_HOTJAR_ID= # OPTIONAL // for UX analytics
NEXT_PUBLIC_ZAPIER_WEBHOOK_DEMO_FORM= # OPTIONAL // for user data form webhooks
NEXT_PUBLIC_ZAPIER_WEBHOOK_SETA_FORM= # OPTIONAL // for user data form webhooks
```

**NB: When adding a new environment variable, it may also need to be added the [ci.yml](ci.yml) file**

### Environment variables

This is a brief explanation for environment variables that need more background.

- FF_DISABLED_COURSES: This feature flag is intended to remove courses from the users course home page. Note that this does not prevent the user from accessing the course completely - the user may still be able to access the course if they navigate to the URL.

In terms of use, the variable could be used to disable a course when it has not been translated to a particular language e.g. if the `healing-from-sexual-trauma/` course is ready in English but not in French, then the course can be enabled in storyblok but still disabled in french. To do this, the the french url slug `fr/courses/healing-from-sexual-trauma/` should be included in the environment variable. This means the course will be hidden in the French version of bloom but still visible to the English version of bloom.

If multiple courses need to be disabled, the slugs will need to be separated by commas.

- NEXT_PUBLIC_FF_USER_RESEARCH_BANNER: This feature flag enables a banner which displays a banner message aimed to gathering users for Bloom feedback. It is intended to be turned on temporarily, for saw 1-2 weeks at a time. It links to an external form which users can fill out if they would like to take part in research.

### Run locally

Start the app in development mode (with hot-code reloading, error reporting, etc.):

```bash
yarn dev
```

Go to [http://localhost:3000](http://localhost:3000)

### Run tests

```bash
yarn test
```

To have your unit tests running in the background as you change code:

```bash
yarn test:watch
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

## Cypress

See [CYPRESS.md](CYPRESS.md) for set up instructions for cypress

**Running the https proxy**
You need to run a https proxy for the storyblok preview.

```bash
// Install mkcert for creating a valid certificate (Mac OS):

          $ brew install mkcert
          $ mkcert -install
          $ mkcert localhost

// Then install and run the proxy

          $ npm install -g local-ssl-proxy
          $ local-ssl-proxy --source 3010 --target 3000 --cert localhost.pem --key localhost-key.pem

// https is now running on port 3010 and forwarding requests to http 3000
```

## Git flow and deployment

Create new branches from the `develop` base branch. There is no need to run the build command before pushing changes to GitHub, simply push and create a pull request for the new branch. GitHub Actions will run build and linting tasks automatically. **Squash and merge** feature/bug branches into `develop`.

When changes are ready to be deployed to staging, in Github create a PR to merge `develop` into `staging`. This should be a **merge** (not squashed). The merge will trigger an automatic deployment to the staging app by Heroku.

When changes have been tested in staging, merge `staging` into `main`, following the same steps as above. This will trigger an automatic deployment to the production app by Heroku.

**New environment variables must be added to Heroku before release.**

## License

Bloom and all of Chayn's projects are open source.
The core tech stack included here is open source however some external integrations used in the project require subscriptions.
