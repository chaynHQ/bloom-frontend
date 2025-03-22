import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import testGroups from './config/test-groups.json';
dotenv.config({ path: '.env.local' });

export default defineConfig({
  projectId: process.env.CYPRESS_PROJECT_ID,
  fileServerFolder: 'cypress',
  defaultCommandTimeout: 10000,
  requestTimeout: 10000,
  responseTimeout: 10000,
  env: process.env, // Uses project environment variables set in .env
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);

      // Get test group from env var if specified
      const testGroup = process.env.CYPRESS_TEST_GROUP;
      if (testGroup && testGroup !== 'all' && testGroups[testGroup]) {
        const patterns = testGroups[testGroup].map(
          (pattern) => `cypress/integration/tests/${pattern}`,
        );
        config.specPattern = patterns;
      }

      // Get specific test pattern if specified
      const specPattern = process.env.CYPRESS_SPEC_PATTERN;
      if (specPattern) {
        config.specPattern = specPattern;
      }

      return config;
    },
    specPattern: ['cypress/integration/tests/**/*.cy.{js,jsx,ts,tsx}'],
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    experimentalRunAllSpecs: true,
    experimentalMemoryManagement: true,
    chromeWebSecurity: false,
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    retries: {
      runMode: 2,
      openMode: 0,
    },
  },
});
