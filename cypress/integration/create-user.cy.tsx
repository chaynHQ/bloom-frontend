// Note bumble is does not have the automatic access code feature

describe('Create User', () => {
  let username = `cypresstestemail+${Date.now()}@chayn.co`;
  before(() => {
    cy.cleanUpTestState();
  });

  it('User should be able to create user', () => {
    // Start from the home page
    cy.visit('/');
    cy.wait(2000);
    cy.get('h2', { timeout: 2000 }).contains('Get started').should('exist');
    cy.get('#primary-get-started-button').click({ force: true });
    cy.wait(2000);
    cy.get('h2', { timeout: 5000 }).should('contain', 'Create account');
    cy.get('#name', { timeout: 5000 }).type('Cypress test');
    cy.get('#email', { timeout: 5000 }).type(username);
    cy.get('#password', { timeout: 5000 }).type('testpassword');
    cy.get('button[type="submit"]').contains('Create account').click();
    cy.wait(3000);
    cy.get('h2', { timeout: 3000 }).should('contain', 'Help us understand');
  });
  after(() => {
    cy.logout();
  });
});
