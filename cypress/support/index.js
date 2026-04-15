// index.js
import '@cypress/code-coverage/support';
const customCommands = require('./commands.js');

// Bypass Vercel Deployment Protection for automated tests
const bypassSecret = Cypress.env('VERCEL_BYPASS_SECRET');
if (bypassSecret) {
  beforeEach(() => {
    cy.setCookie('x-vercel-protection-bypass', bypassSecret);
  });
}

module.exports = {
  commands: customCommands,
};
