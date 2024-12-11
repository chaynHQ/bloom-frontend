// index.js
import '@cypress/code-coverage/support';
const customCommands = require('./commands.js');

module.exports = {
  commands: customCommands,
};

// Calls backend API route to delete cypress users
// Ideally this would be called once after ALL suites are run
// For now we call the API route after every suite is run
after(() => {
  const superAdminEmail = Cypress.env('CYPRESS_SUPER_ADMIN_EMAIL');
  const superAdminPassword = Cypress.env('CYPRESS_SUPER_ADMIN_PASSWORD');
  cy.logInWithEmailAndPassword(superAdminEmail, superAdminPassword);

  cy.deleteAllCypressUsers().then(() => {
    cy.log('After function completed - stale cypress users deleted');
  });
});
