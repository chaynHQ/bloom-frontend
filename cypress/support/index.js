// index.js
import '@cypress/code-coverage/support';
const customCommands = require('./commands.js');

// Bypass Vercel Firewall Attack Challenge Mode for CI.
// The firewall blocks automated requests with 429 challenges; an allow rule
// matching this cookie/header short-circuits the challenge for CI traffic only.
if (Cypress.expose('CI_FIREWALL_BYPASS_ENABLED')) {
  // The token is a secret, so it's read with cy.env() when needed instead of being exposed.
  const withBypassToken = (fn) =>
    cy
      .env(['CYPRESS_CI_FIREWALL_BYPASS'], { log: false })
      .then(({ CYPRESS_CI_FIREWALL_BYPASS }) => fn(CYPRESS_CI_FIREWALL_BYPASS));
  const setBypassCookie = (token) => cy.setCookie('ci-firewall-bypass', token, { log: false });

  // Cookie covers navigation and asset requests (cookies are auto-sent by the browser).
  Cypress.Commands.overwrite('visit', (originalFn, ...args) =>
    withBypassToken((token) => setBypassCookie(token).then(() => originalFn(...args))),
  );

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
    return withBypassToken((token) =>
      originalFn({ ...options, headers: { ...options.headers, 'x-ci-firewall-bypass': token } }),
    );
  });

  // Re-set the cookie before each test — cleanUpTestState calls cy.clearAllCookies
  // in its before() hook, which removes the cookie set by the first cy.visit.
  beforeEach(() => {
    withBypassToken(setBypassCookie);
  });
}

module.exports = {
  commands: customCommands,
};
