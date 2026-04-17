// index.js
import '@cypress/code-coverage/support';
const customCommands = require('./commands.js');

// Bypass Vercel Firewall Attack Challenge Mode for CI.
// The firewall blocks automated requests with 429 challenges; an allow rule
// matching this cookie/header short-circuits the challenge for CI traffic only.
const firewallBypass = Cypress.env('CI_FIREWALL_BYPASS');
if (firewallBypass) {
  // Cookie covers navigation and asset requests (cookies are auto-sent by the browser).
  Cypress.Commands.overwrite('visit', (originalFn, ...args) => {
    cy.setCookie('ci-firewall-bypass', firewallBypass);
    return originalFn(...args);
  });

  // Header covers cy.request (cookies from cy.setCookie aren't always sent with it).
  Cypress.Commands.overwrite('request', (originalFn, ...args) => {
    let options;
    if (typeof args[0] === 'object') {
      options = { ...args[0] };
    } else if (typeof args[0] === 'string' && typeof args[1] === 'string') {
      options = { method: args[0], url: args[1], body: args[2] };
    } else {
      options = { url: args[0], body: args[1] };
    }
    options.headers = { ...options.headers, 'x-ci-firewall-bypass': firewallBypass };
    return originalFn(options);
  });

  // Re-set the cookie before each test — cleanUpTestState calls cy.clearAllCookies
  // in its before() hook, which removes the cookie set by the first cy.visit.
  beforeEach(() => {
    cy.setCookie('ci-firewall-bypass', firewallBypass);
  });
}

module.exports = {
  commands: customCommands,
};
