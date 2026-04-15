// index.js
import '@cypress/code-coverage/support';
const customCommands = require('./commands.js');

// Bypass Vercel Deployment Protection for automated tests.
// 1. cy.visit: appends bypass query params so the first navigation isn't blocked,
//    and x-vercel-set-bypass-cookie tells Vercel to set a session cookie.
// 2. cy.request: adds the bypass header for direct HTTP requests (e.g. sitemap).
// 3. beforeEach: re-sets the bypass cookie in case cy.clearAllCookies() removed it.
const bypassSecret = Cypress.env('VERCEL_BYPASS_SECRET');
if (bypassSecret) {
  Cypress.Commands.overwrite('visit', (originalFn, url, options) => {
    const baseUrl = Cypress.config('baseUrl') || '';
    const fullUrl = new URL(url, baseUrl);
    fullUrl.searchParams.set('x-vercel-protection-bypass', bypassSecret);
    fullUrl.searchParams.set('x-vercel-set-bypass-cookie', 'samesitenone');
    return originalFn(fullUrl.toString(), options);
  });

  Cypress.Commands.overwrite('request', (originalFn, ...args) => {
    let options = typeof args[0] === 'object' ? { ...args[0] } : {};
    if (typeof args[0] === 'string' && typeof args[1] === 'string') {
      options = { method: args[0], url: args[1], body: args[2] };
    } else if (typeof args[0] === 'string') {
      options = { url: args[0], body: args[1] };
    }
    options.headers = { ...options.headers, 'x-vercel-protection-bypass': bypassSecret };
    return originalFn(options);
  });

  beforeEach(() => {
    // Re-establish the Vercel bypass cookie before each test, in case
    // cy.clearAllCookies() removed it (e.g. in cleanUpTestState).
    // The cy.visit override adds the bypass query params automatically,
    // which tells Vercel to set the _vercel_jwt session cookie.
    cy.visit('/', { failOnStatusCode: false });
  });
}

module.exports = {
  commands: customCommands,
};
