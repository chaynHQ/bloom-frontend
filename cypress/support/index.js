// index.js
const customCommands = require('./commands.js');

before(() => {
  //Delete all cypress test users before cypress test suite runs
  cy.visit('/');
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
