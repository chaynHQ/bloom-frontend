# Bloom

Bloom is a remote trauma support service from Chayn, a global charity supporting survivors of abuse across borders. Bloom is our flagship product; a free, web-based support service designed for anyone who has experienced or is currently experiencing domestic or sexual abuse. Through a combination of online video-based courses, anonymous interaction and 1:1 chat, Bloom aims to provide tailored information, guidance, everyday tools, and comforting words to cope with traumatic events. 💖

## Get Involved

If you would like to help Chayn and receive special access to our organization and volunteer opportunities, please [visit our Getting Involved guide](https://chayn.notion.site/Get-involved-423c067536f3426a88005de68f0cab19). We'll get back to you to schedule an onboarding call. Other ways to get involved and support us are [donating](https://www.paypal.me/chaynhq), starring this repo and making an open-source contribution here on GitHub, and supporting us on social media!

Our social medias:

Website - [Chayn](https://www.chayn.co/)

Twitter - [@ChaynHQ](https://twitter.com/ChaynHQ)

Instagram - [@chaynhq](https://www.instagram.com/chaynhq/)

Youtube - [Chayn Team](https://www.youtube.com/channel/UC5_1Ci2SWVjmbeH8_USm-Bg)

LinkedIn - [@chayn](https://www.linkedin.com/company/chayn)

# Bloom Frontend

For a more detailed explanation of this project's key concepts and architecture, please visit the [/docs directory](https://github.com/chaynHQ/bloom-frontend/tree/develop/docs)

[![Bloom CI Pipeline](https://github.com/chaynHQ/bloom-frontend/actions/workflows/deploy-to-staging.yml/badge.svg)](https://github.com/chaynHQ/bloom-frontend/actions/workflows/deploy-to-staging.yml)

**Currently in active development**

## How to Contribute

Before making a contribution, please follow these steps:

1. Follow our Contributing Guidelines in [CONTRIBUTING.md](/CONTRIBUTING.md).
2. Follow the [Git Flow and Deployment directions](#git-flow-and-deployment) at the end of this file.

Happy coding! ⭐

### Technologies Used

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

### Prerequisites

- NodeJS v16.x
- Yarn v1.x

### Run local backend

See [bloom-backend](https://github.com/chaynHQ/bloom-backend) for instructions.
You will need to run this in the background for the frontend to be functional.

### Install dependencies

```bash
yarn
```

### Create .env.local file

Include the following environment variables in a .env.local file.

You will need to gather the following tokens from [Firebase](https://firebase.google.com/docs/auth) and [Storyblok](https://www.storyblok.com/).

If you're an official Chayn volunteer loading up the front-end, please get in touch with the team for access to the environment variables.

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
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

NEXT_PUBLIC_STORYBLOK_TOKEN=

NEXT_PUBLIC_CRISP_WEBSITE_ID= # OPTIONAL for user messaging
NEXT_PUBLIC_SIMPLYBOOK_WIDGET_URL= # OPTIONAL for booking session forms
NEXT_PUBLIC_HOTJAR_ID= # OPTIONAL for UX analytics
NEXT_PUBLIC_ZAPIER_WEBHOOK_DEMO_FORM= # OPTIONAL for user data form webhooks
NEXT_PUBLIC_ZAPIER_WEBHOOK_SETA_FORM= # OPTIONAL for user data form webhooks
```

**If creating new environment variables:**

- Check if the new environment variable must be added the [ci.yml](ci.yml) file.
- Note that new environment variables must be added to Heroku before release to production. Please tag staff in your issue if creating new environment variables.

### Additional Environment variables

These additional environment variables are optional:

- `FF_DISABLED_COURSES`: This feature flag is intended to remove courses from the users course home page. Note that this does not prevent the user from accessing the course completely - the user may still be able to access the course if they navigate to the URL.

  In terms of use, the variable could be used to disable a course when it has not been translated to a particular language e.g. if the `healing-from-sexual-trauma/` course is ready in English but not in French, then the course can be enabled in storyblok but still disabled in french. To do this, the the french url slug `fr/courses/healing-from-sexual-trauma/` should be included in the environment variable. This means the course will be hidden in the French version of bloom but still visible to the English version of bloom. If multiple courses need to be disabled, the slugs will need to be separated by commas.

- `NEXT_PUBLIC_FF_USER_RESEARCH_BANNER`: This feature flag enables a banner which displays a banner message aimed to gathering users for Bloom feedback. It is intended to be turned on temporarily, for saw 1-2 weeks at a time. It links to an external form which users can fill out if they would like to take part in research.

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

## Cypress Testing

See [CYPRESS.md](CYPRESS.md) for set up instructions for cypress tests.

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

### Directions for Contributors:

1. Fork and create new branches from the `develop` base branch, this is the default branch for this repo.

2. Open a pull request from your forked feature branch into the `develop` base branch. This will trigger GitHub Actions to automatically run build and linting tasks.

3. Ensure your changes are correct and test new functionalities on our staging website:

   https://bloom-frontend-staging.herokuapp.com/

   The staging website will show your changes before our production website.

### Using the Staging Website

- [bloom.chayn.co](http://bloom.chayn.co) - live 'production' website.
- https://bloom-frontend-staging.herokuapp.com/ - demo ‘staging’ site, where we test and build things before releasing to production.

Using the staging site means that your usage/testing doesn’t impact our metrics. For example, if you signed up for a new account for testing on the live site, then we would count that as one more user who signed up. To prevent testing data mixing with user data, the staging site usage data is not tracked.

**You should be using the staging site whenever possible.**

**To use the staging website, navigate to it and click 'Get Started' in the homepage to create a new account with any email and password.**

If you already have an account, please login using the email and password you already set.
If it says your account it already registered and you can’t remember the password, use the password reset flow. If you want to create multiple accounts, you can add a +1 to your email like <hello+1>@chayn.co and it will treat it as a new email address (but the emails still go to your inbox, magic ✨)

Our staging site works almost exactly like our live website, except for:

- When you open chat, it will show a fake set of ‘chat team’ members available.
- When you send a chat, no-one will reply.
- We might have also set the chat text to be different on staging, if we are testing options.
- When you go to book a therapy session, you will see fake therapists.
- When you book a therapy session, it won’t actually book a session with anyone.
- When you get the email confirmation of a therapy session, it won’t show the same email as we send to Bumble/Badoo users.

You might want to use the live site if:

- You want to test something about chat
- You want to book a therapy session with one of the therapists as part of their onboarding
- A bug has been reported but you can’t see it on Staging, so you want to see if it’s only affecting the live site

### The Development Lifecycle:

Merging into `develop` will trigger:

1. Automatic deployment to our staging website: https://bloom-frontend-staging.herokuapp.com/
2. A pull request against the `main` branch, which automatically triggers deployment to production in Heroku.

   **The develop branch is our source of truth, not main.**

## License

This project uses the [MIT License](/LICENCE.md).

Bloom and all of Chayn's projects are open-source.

While the core tech stack included here is open-source, some external integrations used in this project require subscriptions.
