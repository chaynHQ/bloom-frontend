import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config({ path: '.env.local' });

export default defineConfig({
  projectId: 'to91wg',
  fileServerFolder: 'cypress',
  env: {
    login_path: 'auth/login',
    reset_password_path: 'auth/reset-password',
    reset_pwd_confirm_email: 'tech@chayn.co',
    ...process.env,
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/config/plugins')(on, config);
    },
    specPattern: ['cypress/integration/**/*.cy.{js,jsx,ts,tsx}'],
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/index.js',
  },
});
