// index.js
const customCommands = require('./commands.js');

after(() => {
  //Delete all cypress test users before cypress test suite runs
  cy.logInWithEmailAndPassword(
    Cypress.env('super_admin_email'),
    Cypress.env('super_admin_password'),
  );
  cy.deleteCypressAccessCodes();
  cy.deleteAllCypressUsers();
  cy.logout();
});

module.exports = {
  commands: customCommands,
};
