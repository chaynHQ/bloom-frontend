import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config({ path: '.env.local' });

export default defineConfig({
  projectId: process.env.CYPRESS_PROJECT_ID,
  fileServerFolder: 'cypress',
  defaultCommandTimeout: 10000,
  env: process.env, // Uses project environment variables set in .env
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      return config;
    },
    specPattern: [
      'cypress/integration/before/**/*.cy.{js,jsx,ts,tsx}',
      'cypress/integration/tests/**/*.cy.{js,jsx,ts,tsx}',
      'cypress/integration/after/**/*.cy.{js,jsx,ts,tsx}',
    ],
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    supportFile: 'cypress/support/index.js',
    experimentalRunAllSpecs: true,
    experimentalMemoryManagement: true,
    chromeWebSecurity: false,
  },
});
