# Local Development Guide:

## Summary

**The develop branch is our source of truth.** Fork from develop, and when your PR is merged, develop will automatically merge into the main branch for deployment to production. Consider [staging your frontend](https://github.com/chaynHQ/bloom-frontend/wiki/Staging-Directions) to test changes after opening your PR.

To run Bloom's frontend:

1. Install prerequisites
2. Run Bloom's backend locally
3. Configure environment variables
4. Install dependencies
5. Run the app with yarn

To test the frontend:

- Run unit tests
- Run integration tests for fullstack contributions. \*[requires populating your database first](https://github.com/chaynHQ/bloom-backend?tab=readme-ov-file#populate-database)

Additional Resources:

- Read our [Bloom Technical Wiki Docs](https://github.com/chaynHQ/bloom-frontend/wiki) for overviews of key concepts, software architecture, staging directions, and design guides.

## Prerequisites

- NodeJS 20.x
- Yarn v1.x
- Read [Contribution Guidelines](https://github.com/chaynHQ/bloom-frontend/blob/develop/CONTRIBUTING.md)

## Run Local Backend

See [Bloom's backend repo](https://github.com/chaynHQ/bloom-backend) for instructions. You will need to run this in the background for the frontend to be functional.

## Configure Environment Variables

See [Environment Variables Configuration Instructions](configure-env.md).

## Install Dependencies

Install dependencies by running:

```bash
yarn
```

## Run Locally with yarn

Start the app in development mode (with hot-code reloading, error reporting, etc.):

```bash
yarn dev
```

Go to [http://localhost:3000](http://localhost:3000)

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

## Unit Testing

The frontend uses Jest for unit testing. Simply run:

```bash
yarn test
```

To have your unit tests running in the background as you change code:

```bash
yarn test:watch
```

## Cypress Testing

See [Cypress Directions](configure-cypress.md) for set-up instructions. Cypress e2e integration tests are required for most full-stack contributions.

## Happy Paths

In addition to unit and integration testing, contributors should ensure their happy paths (the ideal, error-free path for a user to complete a task or achieve a goal in Bloom). View [our Happy Paths here](https://chayn.notion.site/Bloom-happy-paths-e2cc25f206f9494d8cfcf7df718a0679).
