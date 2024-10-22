# Welcome to Bloomm

[![Bloom CI Pipeline](https://github.com/chaynHQ/bloom-frontend/actions/workflows/build-and-test-prs.yml/badge.svg)](https://github.com/chaynHQ/bloom-frontend/actions/workflows/build-and-test-prs.yml)

Bloom is a remote trauma support service from [Chayn](https://www.chayn.co/about), a global, award-winning charity designing open-source tools to support the healing of survivors across the world. Since 2013, Chayn has reached over 500,000 survivors worldwide with our trauma-informed, survivor-centred, and intersectional approaches in utilizing tech for social impact. Bloom is our flagship product; a free, web-based, secure support service designed to aid in the healing of survivors. Through a combination of online video-based courses, anonymous interaction, and 1:1 chat, Bloom provides tailored information, self-help guidance, everyday tools, and comfort to cope with traumatic events.

Explore Chayn's [website](https://www.chayn.co/about), [research](https://org.chayn.co/research), [resources](https://www.chayn.co/resources), [projects](https://org.chayn.co/projects), [impact](https://org.chayn.co/impact), and [support services directory](https://www.chayn.co/global-directory). 💖

## Support Our Work

Chayn is proudly open-source and built with volunteer contributions. We are grateful for the generosity of the open-source community and aim to provide a fulfilling experience for open-source developers.

**Please give this repository a star ⭐ and follow our GitHub profile 🙏 to help us grow our open-source community and find more contributors like you!**

Support our mission further by [sponsoring us on GitHub](https://github.com/sponsors/chaynHQ), exploring our [volunteer programs](https://www.chayn.co/get-involved), and following Chayn on social media: - Linktree: [https://linktr.ee/chayn](https://linktr.ee/chayn) - Twitter: [@chaynhq](https://twitter.com/ChaynHQ) - Instagram: [@chaynhq](https://www.instagram.com/chaynhq/) - Youtube: [@chaynhq](https://www.youtube.com/@chaynhq) - Facebook: [@chayn](https://www.facebook.com/chayn) - LinkedIn: [@chayn](https://www.linkedin.com/company/chayn).

# Bloom Frontend Contribution Docs:

By making an open-source contribution to Chayn, you have agreed to our [Code of Conduct](/CODE_OF_CONDUCT.md).

Happy coding! ⭐

## Technologies Used

Visit the [/docs directory](https://github.com/chaynHQ/bloom-frontend/tree/develop/docs) for an overview of Bloom's frontend key concepts.

- [React](https://reactjs.org/) - JavaScript library for building component based user interfaces
- [Next.js](https://nextjs.org/) - React framework for hybrid static & server rendering, file-system routing and more
- [Vercel](https://vercel.com/) - Build, deploy and host staging and production apps
- [Typescript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [Redux Toolkit](https://redux-toolkit.js.org/) - Opinionated Redux package for state management
- [Firebase](https://firebase.google.com/docs/auth) - User authentication and analytics
- [Material UI / MUI](https://mui.com/) - React UI library for prebuilt components
- [Storyblok](https://www.storyblok.com/) - Headless CMS for pages and courses content
- [Simplybook](https://simplybook.me/en/) - Appointment booking system used for therapy
- [Crisp](https://crisp.chat/en/) - User messaging
- [Rollbar](https://rollbar.com/) - Error reporting
- [New Relic](https://newrelic.com/) - Performance monitoring
- [GitHub Actions](https://github.com/features/actions) - CI pipeline
- [Jest](https://jestjs.io/) - Unit testing.
- [Cypress](https://www.cypress.io/) - End-to-end testing.
- [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) for linting and formatting.

## Local Development:

### Summary

To run Bloom's frontend: install prerequisites, run Bloom's backend locally, configure environment variables, install dependencies, then run the app locally with yarn.

Before running Cypress integration tests, first populate your backend local database with test data ([directions in Bloom's backend repo](https://github.com/chaynHQ/bloom-backend?tab=readme-ov-file#populate-database)).

## Prerequisites

- NodeJS 20.x
- Yarn v1.x
- Read [Contribution Guidelines](/CONTRIBUTING.md)

### Run Local Backend

See [Bloom's backend repo](https://github.com/chaynHQ/bloom-backend) for instructions. You will need to run this in the background for the frontend to be functional.

### Configure Environment Variables

Create a new `.env.local` file and fill it with the required environment variables:

```
# Variables for building, unit tests, and integration tests.
# Provided variables are read-only and subject to change.
#====================================================================
# REQUIRED VARIABLES FOR LOCAL DEVELOPMENT
#--------------------------------------------------------------------
# CORE ENVIRONMENT VARIABLES
NEXT_PUBLIC_ENV=local
NEXT_PUBLIC_API_URL=http://localhost:35001/api/v1
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_PORT=3000

# FIREBASE AUTH AND ANALYTICS
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# CONTENT TOKEN
NEXT_PUBLIC_STORYBLOK_TOKEN=xB5HoaLRkYs8ySylSUnZjQtt

# FEATURE FLAGS
NEXT_PUBLIC_FF_USER_RESEARCH_BANNER=true

# REQUIRED VARIABLES FOR CYPRESS INTEGRATION TESTING
# SEE CYPRESS.MD FOR INSTRUCTIONS
#--------------------------------------------------------------------
# CYPRESS PROJECT
CYPRESS_PROJECT_ID=

# MAILSLURP
CYPRESS_MAIL_SLURP_API_KEY=
CYPRESS_INBOX_ID=

# LOCAL BLOOM USERS
CYPRESS_SUPER_ADMIN_EMAIL=
CYPRESS_SUPER_ADMIN_PASSWORD=
CYPRESS_PUBLIC_NAME=
CYPRESS_PUBLIC_EMAIL=
CYPRESS_PUBLIC_PASSWORD=
CYPRESS_BUMBLE_PARTNER_ADMIN_EMAIL=
CYPRESS_BUMBLE_PARTNER_ADMIN_PASSWORD=
CYPRESS_BADOO_PARTNER_ADMIN_EMAIL=
CYPRESS_BADOO_PARTNER_ADMIN_PASSWORD=

# OPTIONAL VARIABLES
#--------------------------------------------------------------------
# NEW RELIC TRACKING
NEW_RELIC_LICENSE_KEY=eu01xx6fc63a14eea79c367dfe82e702FFFFNRAL
NEW_RELIC_APP_NAME=bloom-frontend
NEW_RELIC_BROWSER_MONITORING_KEY=NRJS-0f9d5f21ee9234a45cc

# ANALYTICS
NEXT_PUBLIC_HOTJAR_ID=
NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID=

# ADDITIONAL FEATURES
NEXT_PUBLIC_CRISP_WEBSITE_ID= # User messaging
NEXT_PUBLIC_SIMPLYBOOK_WIDGET_URL= # Booking session forms
NEXT_PUBLIC_ZAPIER_WEBHOOK_DEMO_FORM= # User data form webhooks
NEXT_PUBLIC_ZAPIER_WEBHOOK_SETA_FORM= # User data form webhooks
NEXT_PUBLIC_ROLLBAR_ENV= # Rollbar logging
NEXT_PUBLIC_ROLLBAR_TOKEN= # Rollbar logging
```

#### How to Configure Firebase Variables:

To configure the Firebase variables, [create a Firebase project in the Firebase console](https://firebase.google.com/) (Google account required). For additional guidance on setting environment variables, check out our [Chayn Tech Wiki Guide](https://www.notion.so/chayn/Chayn-Tech-Contributor-Wiki-5356c7118c134863a2e092e9df6cbc34?pvs=4#bf62b5dcdb43496ea16231ff1815298b).

#### How to Create New Environment Variables:

If creating new environment variables, please tag Chayn staff developers in PR / issue discussions to let us know. New environment variables may require being added to Vercel (required for production-level variables) and GitHub Actions (required for app to build and pass CI tests). Note: Environment variables that are exposed to the client/browser must be prefixed with `NEXT_PUBLIC_` - see [next.js docs](https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser).

#### Additional Helper Environment Variables (optional):

- `FF_DISABLED_COURSES`: This feature flag is intended to remove courses from the users course home page. Note that this does not prevent the user from accessing the course completely - the user may still be able to access the course if they navigate to the URL.

  In terms of use, the variable could be used to disable a course when it has not been translated to a particular language e.g. if the `healing-from-sexual-trauma/` course is ready in English but not in French, then the course can be enabled in storyblok but still disabled in french. To do this, the the french url slug `fr/courses/healing-from-sexual-trauma/` should be included in the environment variable. This means the course will be hidden in the French version of bloom but still visible to the English version of bloom. If multiple courses need to be disabled, the slugs will need to be separated by commas.

- `NEXT_PUBLIC_FF_USER_RESEARCH_BANNER`: This feature flag enables a banner which displays a banner message aimed to gathering users for Bloom feedback. It is intended to be turned on temporarily, for saw 1-2 weeks at a time. It links to an external form which users can fill out if they would like to take part in research.

#### How to Import Environment Variables with Vercel (Chayn team only):

- Chayn staff can import all environment variables from Vercel. Ask the team for access, then proceed to the [Vercel Environment Variable Import](#vercel-environment-variable-import) for directions. Environment variables are defined and stored in Vercel for each of the environments: development, preview and production. Read more about Vercel environment variables [here](https://vercel.com/docs/concepts/projects/environment-variables). These environment variables can be imported using the Vercel CLI.

  Download and login to the Vercel CLI:

  ```bash
  npm i -g vercel
  vercel login
  ```

  Link the Vercel project to your local directory:

  ```bash
  vercel link

  # copy these answers
  Vercel CLI 24.1.0
  ? Set up “~/yourpath/bloom-frontend? [Y/n] y
  ? Which scope should contain your project? Chayn
  ? Found project “chaynhq/bloom-frontend”. Link to it? [Y/n] y
  ✅  Linked to chaynhq/bloom-frontend (created .vercel)
  ```

  Download the local environment variables files from Vercel:

  ```bash
  vercel env pull .env.local
  ```

### Install Dependencies

Install dependencies by running:

```bash
yarn
```

### Run Locally with yarn

Start the app in development mode (with hot-code reloading, error reporting, etc.):

```bash
yarn dev
```

Go to [http://localhost:3000](http://localhost:3000)

### Unit Testing

```bash
yarn test
```

To have your unit tests running in the background as you change code:

```bash
yarn test:watch
```

### Format and Linting

Linting and formatting are provided by [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/). We recommend VSCode users to utilize the workspace settings in [.vscode/settings.json](.vscode/settings.json) and install the extensions in [.vscode/extensions](.vscode/extensions.json) for automated consistency.

Additionally, this application uses [Pre-commit](https://pre-commit.com/) and [husky](https://typicode.github.io/husky/) to run formatting and linting before each commit is pushed. If an error is thrown when pushing a commit:

- check the output logs for linting errors - fix all linting errors before committing.
- check file changes for new formatting changes - if formatting fixes were applied during pre-commit, the original changes will now be staged, and new formatted changes will need to be staged and committed.

**We strongly recommend maintaining consistent code style by linting and formatting before every commit:**

Run linting:

```bash
yarn lint
```

Run lint and fix:

```bash
yarn lint:fix
```

Run format and fix:

```bash
yarn format
```

### Build for Production

For testing the production build. This will be run automatically during [deployments](#git-flow-and-deployment).

```bash
yarn build
```

## Cypress Testing

Bloom uses Cypress to perform end-to-end (e2e) tests of platform.
See [CYPRESS.md](CYPRESS.md) for set-up instructions.

## Git Flow and Deployment

**The develop branch is our source of truth, not main.**

### Staging Directions for Contributors

Testing the staging preview is helpful for making front-end design changes.

1. Creating a pull request will trigger GitHub Actions to automatically run build and linting tasks. A [vercel preview url](https://vercel.com/docs/deployments/preview-deployments) will also be created, to act as a staging environment for this branch
2. Test the new branch on the vercel preview url, and ensure all new changes working as expected
3. Request a code review from a staff member who will manage the merge and deployment flow.

### Staging Merge and Deployment Flow Directions for Maintainers

1. When a pull request is approved, **squash and merge** the pull request into `develop`. Merging a pull request into `develop` will trigger a deployment to the [staging preview url](https://bloom-frontend-git-develop-chaynhq.vercel.app/). A new pull request `Merge Develop onto Main` will be automatically created when `develop` is ahead of `main`

2. This new `Merge Develop onto Main` pull request will be aligned to the [staging preview url](https://bloom-frontend-git-develop-chaynhq.vercel.app/) and should be retested where multiple changes have been made - this may not be required where changes are unrelated and were all tested individually

3. When changes are ready to be released to production, **merge** the new `Merge Develop onto Main` pull request. This will merge `develop` into `main` and trigger an automatic deployment to production via the Github <-> Vercel integration which aligns to the `main` branch

### Using the Staging and Preview URLSs:

- Production url: https://bloom.chayn.co

- Staging preview url: https://bloom-frontend-git-develop-chaynhq.vercel.app/

- Example branch preview url: https://bloom-frontend-git-vercel-branch-name-chaynhq.vercel.app/

Using the preview urls means that your usage/testing doesn’t impact our metrics. For example, if you signed up for a new account for testing on the live site, then we would count that as one more user who signed up. To prevent testing data mixing with user data, the preview urls usage data is not tracked.

**You should be using the preview urls whenever possible.**

**To use the preview urls, navigate to them and click 'Get Started' in the homepage to create a new account with any email and password.**

If you already have an account, please login using the email and password you already set.
If it says your account it already registered and you can’t remember the password, use the password reset flow. If you want to create multiple accounts, you can add a +1 to your email like <hello+1>@chayn.co and it will treat it as a new email address (but the emails still go to your inbox, magic ✨)

Our preview urls work almost exactly like our live website, except for:

- When you open chat, it will show a fake set of ‘chat team’ members available.
- When you send a chat, no-one will reply.
- We might have also set the chat text to be different on staging/preview, if we are testing options.
- When you go to book a therapy session, you will see fake therapists.
- When you book a therapy session, it won’t actually book a session with anyone.
- When you get the email confirmation of a therapy session, it won’t show the same email as we send to Bumble/Badoo users.

You might want to use the live site if:

- You want to test something about chat
- You want to book a therapy session with one of the therapists as part of their onboarding
- A bug has been reported but you can’t see it on preview, so you want to see if it’s only affecting the live site
- To test features that only work on production e.g. Hotjar

## License

This project uses the [MIT License](/LICENCE.md).

Bloom and all of Chayn's projects are open-source.

While the core tech stack included here is open-source, some external integrations used in this project require subscriptions.
