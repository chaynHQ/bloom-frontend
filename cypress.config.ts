import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config({ path: '.env.local' });

// Helper to delete all cypress test users after the test run
async function deleteAllCypressUsers() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const superAdminEmail = process.env.CYPRESS_SUPER_ADMIN_EMAIL;
  const superAdminPassword = process.env.CYPRESS_SUPER_ADMIN_PASSWORD;

  if (!apiUrl || !firebaseApiKey || !superAdminEmail || !superAdminPassword) {
    console.log('Skipping cypress user cleanup - missing environment variables');
    return;
  }

  try {
    // Sign in with Firebase REST API to get an ID token
    const authResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: superAdminEmail,
          password: superAdminPassword,
          returnSecureToken: true,
        }),
      },
    );

    if (!authResponse.ok) {
      console.error('Failed to authenticate for cleanup:', await authResponse.text());
      return;
    }

    const authData = await authResponse.json();
    const idToken = authData.idToken;

    // Delete all cypress test users
    const deleteResponse = await fetch(`${apiUrl}/user/cypress`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (deleteResponse.ok) {
      console.log('Successfully deleted all cypress test users');
    } else {
      console.error('Failed to delete cypress users:', await deleteResponse.text());
    }
  } catch (error) {
    console.error('Error during cypress user cleanup:', error);
  }
}

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

      // Run cleanup after all tests complete (runs even if tests fail)
      on('after:run', async () => {
        console.log('Running post-test cleanup...');
        await deleteAllCypressUsers();
      });

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
