import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { MailSlurp } from 'mailslurp-client';
dotenv.config({ path: '.env.local' });

// Public values the specs read in the browser with Cypress.expose(). NEXT_PUBLIC_* vars are
// public by definition; anything else must be listed here explicitly.
const exposedKeys = [
  'CYPRESS_SUPER_ADMIN_EMAIL',
  'CYPRESS_BUMBLE_PARTNER_ADMIN_EMAIL',
  'CYPRESS_BADOO_PARTNER_ADMIN_EMAIL',
  'CYPRESS_PUBLIC_EMAIL',
  'CYPRESS_PUBLIC_NAME',
];

// Secrets stay in the Node process and are read only when needed with cy.env().
const secretKeys = [
  'CYPRESS_SUPER_ADMIN_PASSWORD',
  'CYPRESS_BUMBLE_PARTNER_ADMIN_PASSWORD',
  'CYPRESS_BADOO_PARTNER_ADMIN_PASSWORD',
  'CYPRESS_PUBLIC_PASSWORD',
  'CYPRESS_CI_FIREWALL_BYPASS',
];

const pickEnv = (keys: string[]) => Object.fromEntries(keys.map((key) => [key, process.env[key]]));

export default defineConfig({
  projectId: process.env.CYPRESS_PROJECT_ID,
  fileServerFolder: 'cypress',
  defaultCommandTimeout: 10000,
  requestTimeout: 10000,
  responseTimeout: 10000,
  retries: { runMode: 2, openMode: 0 },
  expose: {
    ...pickEnv(Object.keys(process.env).filter((key) => key.startsWith('NEXT_PUBLIC_'))),
    ...pickEnv(exposedKeys),
    // Lets the support file decide whether to install the bypass without reading the token.
    CI_FIREWALL_BYPASS_ENABLED: !!process.env.CYPRESS_CI_FIREWALL_BYPASS,
  },
  env: pickEnv(secretKeys),
  e2e: {
    setupNodeEvents(on, config) {
      // Code coverage - only active when CYPRESS_COVERAGE=true
      if (process.env.CYPRESS_COVERAGE === 'true') {
        require('@cypress/code-coverage/task')(on, config);
      }

      // MailSlurp runs here so its API key never reaches the browser.
      on('task', {
        waitForLatestEmail() {
          const mailslurp = new MailSlurp({ apiKey: process.env.CYPRESS_MAIL_SLURP_API_KEY! });
          return mailslurp.waitForLatestEmail(process.env.CYPRESS_INBOX_ID, 8000);
        },
      });

      return config;
    },
    specPattern: [
      'cypress/integration/**/*.cy.{js,jsx,ts,tsx}',
      'cypress/integration/*.cy.{js,jsx,ts,tsx}', // Catch ungrouped tests in root
    ],
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    supportFile: 'cypress/support/index.js',
    experimentalRunAllSpecs: true,
    chromeWebSecurity: false,
  },
});
