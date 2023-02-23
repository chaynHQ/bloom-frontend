import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'to91wg',
  fileServerFolder: 'cypress',
  env: {
    login_path: 'auth/login',
    reset_password_path: 'auth/reset-password',
    reset_pwd_confirm_email: 'test@test.com',
    api_url: 'http://localhost:35001/api/v1',
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/config/plugins')(on, config);
    },
    specPattern: 'cypress/integration/**/*.cy.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/index.js',
  },
});
