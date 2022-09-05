import { defineConfig } from 'cypress';

export default defineConfig({
  fileServerFolder: 'cypress',
  env: {
    login_path: 'auth/login',
    'reset-password-path': 'auth/reset-password',
    'reset-pwd-confirm-email': 'test@test.com',
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/config/plugins')(on, config);
    },
    specPattern: 'cypress/integration/**/*.cy.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:3000',
  },
});
