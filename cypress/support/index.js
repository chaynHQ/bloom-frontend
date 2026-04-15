// index.js
import '@cypress/code-coverage/support';
const customCommands = require('./commands.js');

// Bypass Vercel Deployment Protection for automated tests.
// Appends bypass query params on cy.visit so the first navigation
// is not redirected to Vercel's auth page. The x-vercel-set-bypass-cookie
// param tells Vercel to set a session cookie for all subsequent requests.
const bypassSecret = Cypress.env('VERCEL_BYPASS_SECRET');
if (bypassSecret) {
  Cypress.Commands.overwrite('visit', (originalFn, url, options) => {
    const baseUrl = Cypress.config('baseUrl') || '';
    const fullUrl = new URL(url, baseUrl);
    fullUrl.searchParams.set('x-vercel-protection-bypass', bypassSecret);
    fullUrl.searchParams.set('x-vercel-set-bypass-cookie', 'samesitenone');
    return originalFn(fullUrl.toString(), options);
  });
}

module.exports = {
  commands: customCommands,
};
