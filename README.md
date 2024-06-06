# Welcome to Bloom

[![Bloom CI Pipeline](https://github.com/chaynHQ/bloom-frontend/actions/workflows/build-and-test-prs.yml/badge.svg)](https://github.com/chaynHQ/bloom-frontend/actions/workflows/build-and-test-prs.yml)

**Currently in active development.**

Bloom is a remote trauma support service from Chayn, a global charity supporting survivors of abuse across borders. Bloom is our flagship product; a free, web-based support service designed for anyone who has experienced or is currently experiencing domestic or sexual abuse. Through a combination of online video-based courses, anonymous interaction and 1:1 chat, Bloom aims to provide tailored information, guidance, everyday tools, and comforting words to cope with traumatic events. 💖

For a more detailed explanation of this project's key concepts and architecture, please visit the [/docs directory](https://github.com/chaynHQ/bloom-frontend/tree/develop/docs).

## Get Involved

Do you want to make an impact with Chayn and receive special access to our organization and volunteer opportunities? Please visit our [Getting Involved Guide](https://www.chayn.co/get-involved) to get started!

Other ways you can support Chayn are [donating](https://www.paypal.me/chaynhq), starring this repository ⭐ (so we can find more contributors like you!), making an open-source contribution, and supporting us on social media!

Find us online:

- Website: [https://www.chayn.co/](https://www.chayn.co/)
- Linktree: [https://linktr.ee/chayn](https://linktr.ee/chayn)
- Twitter: [@ChaynHQ](https://twitter.com/ChaynHQ)
- Instagram: [@chaynhq](https://www.instagram.com/chaynhq/)
- Youtube: [Chayn Team](www.youtube.com/@chaynhq)
- LinkedIn: [@chayn](https://www.linkedin.com/company/chayn)

# Contributing to Bloom Frontend

Before making a contribution, please read our Contributing Guidelines in the [CONTRIBUTING.md](/CONTRIBUTING.md) file.

We ask all contributors to follow our [Contributing Guidelines](/CONTRIBUTING.md) to help Chayn developers maintain open-source best practices.

Happy coding! ⭐

## Technologies Used

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

## Prerequisites

- NodeJS 20.x
- Yarn v1.x

## Local Development:

### Run Local Backend

See [bloom-backend](https://github.com/chaynHQ/bloom-backend) for instructions.
You will need to run this in the background for the frontend to be functional.

### Configure Environment Variables

- **For Chayn staff:** You can import all environment variables from Vercel. Please get in touch with the team for environment variables and access to Vercel. If you already have access, you may proceed to the [Vercel Environment Variable Import](#vercel-environment-variable-import) directions.

- **For open-source contributors:** create a `env.local` file and populate it with the variables below. To configure the Firebase variables, [create a Firebase project in the Firebase console](https://firebase.google.com/) (Google account required). Next, obtain the Storyblok token by visiting our [Chayn Tech Wiki Guide](https://www.notion.so/chayn/Tech-volunteer-wiki-5356c7118c134863a2e092e9df6cbc34?pvs=4#84635bd9b82543ccaab4fb932ca35ebf). Note: environment variables provided by Chayn are subject to change at any time, check for updates if you are experiencing problems.

```
NEXT_PUBLIC_ENV=local
NEXT_PUBLIC_API_URL=http://localhost:35001/api/v1/
NEXT_PUBLIC_BASE_URL=http://localhost:3000

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID= # must enable Google Anayltics in Firebase project

NEXT_PUBLIC_STORYBLOK_TOKEN= # links content to the frontend

NEXT_PUBLIC_CRISP_WEBSITE_ID= # OPTIONAL for user messaging
NEXT_PUBLIC_SIMPLYBOOK_WIDGET_URL= # OPTIONAL for booking session forms
NEXT_PUBLIC_HOTJAR_ID= # OPTIONAL for UX analytics
NEXT_PUBLIC_ZAPIER_WEBHOOK_DEMO_FORM= # OPTIONAL for user data form webhooks
NEXT_PUBLIC_ZAPIER_WEBHOOK_SETA_FORM= # OPTIONAL for user data form webhooks
```

#### Vercel Environment Variable Import:

For Chayn staff only -- if you have access to Vercel as a staff member, follow the instructions below. If you do not have access, please proceed past this section.

Environment variables are defined and stored in Vercel for each of the environments: development, preview and production. Read more about Vercel environment variables [here](https://vercel.com/docs/concepts/projects/environment-variables). These environment variables can be imported using the Vercel CLI.

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

#### Creating New Environment Variables:

When creating new environment variables, for use in production, they must be added to Vercel before release. Please tag staff in your issue if creating new environment variables for production. Additionally, new environment variables that are required for the app to build and pass tests must be added to GitHub Secrets and workflows.

Note: Environment variables that are exposed to the client/browser must be prefixed with `NEXT_PUBLIC_` - see [next.js docs](https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser).

#### Additional Environment Variables:

These additional environment variables are optional:

- `FF_DISABLED_COURSES`: This feature flag is intended to remove courses from the users course home page. Note that this does not prevent the user from accessing the course completely - the user may still be able to access the course if they navigate to the URL.

  In terms of use, the variable could be used to disable a course when it has not been translated to a particular language e.g. if the `healing-from-sexual-trauma/` course is ready in English but not in French, then the course can be enabled in storyblok but still disabled in french. To do this, the the french url slug `fr/courses/healing-from-sexual-trauma/` should be included in the environment variable. This means the course will be hidden in the French version of bloom but still visible to the English version of bloom. If multiple courses need to be disabled, the slugs will need to be separated by commas.

- `NEXT_PUBLIC_FF_USER_RESEARCH_BANNER`: This feature flag enables a banner which displays a banner message aimed to gathering users for Bloom feedback. It is intended to be turned on temporarily, for saw 1-2 weeks at a time. It links to an external form which users can fill out if they would like to take part in research.

### Install Dependencies

After configuring your environment variables, it's time to install dependencies and run the app.

First, to install dependencies, run:

```bash
yarn
```

### Run Locally

Start the app in development mode (with hot-code reloading, error reporting, etc.):

```bash
yarn dev
```

Go to [http://localhost:3000](http://localhost:3000)

### Run Tests

```bash
yarn test
```

To have your unit tests running in the background as you change code:

```bash
yarn test:watch
```

### Formatting and Linting

```bash
yarn lint
```

To lint and fix:

```bash
yarn lint:fix
```

Formatting and linting is provided by ESLint and Prettier (see the relevant configs for details).

**Install the VSCode extensions recommended in the [.vscode/extensions](.vscode/extensions.json) for automated formatting and linting**

Workspace [settings](.vscode/settings.json) for VSCode are included for consistent linting and formatting, and can be replicated if using an alternative IDE.

### Pre-commit and husky checks

[Pre-commit](https://pre-commit.com/) and [husky](https://typicode.github.io/husky/) are set up to run formatting and linting before each commit is pushed.

**Commits will be blocked if there are any formatting or linting issues**

If an error is thrown when pushing a commit:

- check the output logs for linting errors - fix all linting errors before committing
- check file changes for new formatting changes - if formatting fixes were applied during pre-commit, the original changes will now be staged, and new formatted changes will need to be staged and committed

### Build for Production

For testing the production build. This will be run automatically during [deployments](#git-flow-and-deployment).

```bash
yarn build
```

## Cypress Testing

We use Cypress to perform end-to-end (e2e) tests of platform.
See [CYPRESS.md](CYPRESS.md) for set up instructions for Cypress tests.

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

## Git Flow and Deployment

**The develop branch is our source of truth, not main.**

### Directions for Contributors

1. Follow the Contributing Guidelines in [CONTRIBUTING.md](/CONTRIBUTING.md).
2. Fork the repo and create a new branch from the `develop` base branch.
3. Run the app on the new branch, complete your work testing on http://localhost:3000, and commit. Note that commits with linting errors will be blocked - see [pre-commit and husky checks](#pre-commit-and-husky-checks)
4. Go to Github and open a pull request for the branch - the branch should be automatically based off of the `develop` branch. Creating a pull request will trigger GitHub Actions to automatically run build and linting tasks. A [vercel preview url](https://vercel.com/docs/deployments/preview-deployments) will also be created, to act as a staging environment for this branch
5. Test the new branch on the vercel preview url, and ensure all new changes working as expected
6. Request a code review from a staff member who will manage the merge and deployment flow (see below)

### Merge and Deployment Flow

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
