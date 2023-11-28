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
- [Vercel](https://vercel.com/) - Build, deploy and host staging and production apps
- [Typescript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [Redux Toolkit](https://redux-toolkit.js.org/) - Opinionated Redux package for state management
- [Firebase](https://firebase.google.com/docs/auth) - User authentication and analytics
- [Material UI / MUI](https://mui.com/) - React UI library for prebuilt components
- [Storyblok](https://www.storyblok.com/) - Headless CMS for pages and courses content
- [Simplybook](https://simplybook.me/en/) - Appointment booking system used for therapy
- [Crisp](https://crisp.chat/en/) - User messaging
- [Rollbar](https://rollbar.com/) - Error reporting
- [GitHub Actions](https://github.com/features/actions) - CI pipeline

### Prerequisites

- NodeJS v16.x
- Yarn v1.x

### Run local backend

See [bloom-backend](https://github.com/chaynHQ/bloom-backend) for instructions.
You will need to run this in the background for the frontend to be functional.

### Setup Vercel

If you're an official Chayn volunteer loading up the front-end, please get in touch with the team for access to the environment variables. If you have access to Vercel as a staff member, follow the instructions below.

Environment variables are set in Vercel and can be imported using the Vercel CLI - see [environment variables](#environment-variables).
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

### Install dependencies

```bash
yarn
```

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

For testing the production build. This will be run automatically during [deployments](#git-flow-and-deployment).

```bash
yarn build
```

## Environment Variables

Environment variables are defined and stored in Vercel for each of the environments: development, preview and production. Read more about Vercel environment variables [here](https://vercel.com/docs/concepts/projects/environment-variables).

The development `.env.local` file is autogenerated and downloaded using the Vercel CLI. Add new environment variables in the Vercel console and replace your local.env with an updated one by running:

```bash
vercel env pull .env.local
```

### Creating new environment variables

Note that new environment variables must be added to Vercel before release to production. Please tag staff in your issue if creating new environment variables.

Environment variables that are required for the app to build and pass tests must be added to [Github secrets](https://github.com/transition-zero/feo-frontend/settings/secrets/actions) and in the [ci.yml](ci.yml) file.

Environment variables that are exposed to the client/browser must be prefixed with `NEXT_PUBLIC_` - see [next.js docs](https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser)

### Additional environment variables

These additional environment variables are optional:

- `FF_DISABLED_COURSES`: This feature flag is intended to remove courses from the users course home page. Note that this does not prevent the user from accessing the course completely - the user may still be able to access the course if they navigate to the URL.

  In terms of use, the variable could be used to disable a course when it has not been translated to a particular language e.g. if the `healing-from-sexual-trauma/` course is ready in English but not in French, then the course can be enabled in storyblok but still disabled in french. To do this, the the french url slug `fr/courses/healing-from-sexual-trauma/` should be included in the environment variable. This means the course will be hidden in the French version of bloom but still visible to the English version of bloom. If multiple courses need to be disabled, the slugs will need to be separated by commas.

- `NEXT_PUBLIC_FF_USER_RESEARCH_BANNER`: This feature flag enables a banner which displays a banner message aimed to gathering users for Bloom feedback. It is intended to be turned on temporarily, for saw 1-2 weeks at a time. It links to an external form which users can fill out if they would like to take part in research.

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

## Git Flows and Deployments

**The develop branch is our source of truth, not main.**

### Directions for Contributors

1. Fork the repo and create a new branch from the `develop` base branch

2. Run the app on the new branch, complete your work testing on http://localhost:3000, and commit

3. Go to Github and open a pull request for the branch - the branch should be automatically based off of the `develop` branch. Creating a pull request will trigger GitHub Actions to automatically run build and linting tasks. A [vercel preview url](https://vercel.com/docs/deployments/preview-deployments) will also be created, to act as a staging environment for this branch

4. Test the new branch on the vercel preview url, and ensure all new changes working as expected

5. Request a code review from a staff member who will manage the merge and deployment flow (see below)

### Merge and Deployment flow

1. When a pull request is approved, **squash and merge** the pull request into `develop`. Merging a pull request into `develop` will trigger a deployment to the [staging preview url](https://bloom-frontend-git-develop-chaynhq.vercel.app/) and open a new pull request `Merge Develop onto Main` where GitHub Actions are run again

2. When changes are ready to be released to production, **merge** the new `Merge Develop onto Main` pull request. This will merge `develop` into `main` and trigger an automatic deployment to production via the Github <-> Vercel integration which aligns to the `main` branch

### Using the staging and preview urls

Production url: https://bloom.chayn.co
Staging preview url: https://bloom-frontend-git-develop-chaynhq.vercel.app/
Example branch preview url: https://bloom-frontend-git-vercel-branch-name-chaynhq.vercel.app/

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
