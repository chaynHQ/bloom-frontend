import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config({ path: '.env.local' });

export default defineConfig({
  projectId: process.env.CYPRESS_PROJECT_ID,
  fileServerFolder: 'cypress',
  defaultCommandTimeout: 10000,
  requestTimeout: 10000,
  responseTimeout: 10000,
  env: process.env, // Uses project environment variables set in .env
  e2e: {
    setupNodeEvents(on, config) {
      // Code coverage - only active when CYPRESS_COVERAGE=true
      if (process.env.CYPRESS_COVERAGE === 'true') {
        require('@cypress/code-coverage/task')(on, config);
      }

      return config;
    },
    specPattern: ['cypress/integration/tests/**/*.cy.{js,jsx,ts,tsx}'],
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    supportFile: 'cypress/support/index.js',
    experimentalRunAllSpecs: true,
    experimentalMemoryManagement: true,
    chromeWebSecurity: false,
  },
});
