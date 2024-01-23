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
    // TODO put the correct home page check below when it is published
    // cy.get('h2', { timeout: 8000 }).contains('Get started').should('exist');
    // TODO - workout why #primary-get-started-button works locallly and headless but not in github actions
    cy.get('a[href="/auth/register"]', { timeout: 5000 }).first().click({ force: true });
    cy.wait(2000);
    cy.get('h2', { timeout: 8000 }).should('contain', 'Create account');
    cy.get('#name', { timeout: 8000 }).type('Cypress test');
    cy.get('#email', { timeout: 8000 }).type(username);
    cy.get('#password', { timeout: 8000 }).type('testpassword');
    cy.get('button[type="submit"]').contains('Create account').click();
    cy.wait(3000);
    cy.get('h2', { timeout: 8000 }).should('contain', 'Help us understand');
  });
  after(() => {
    cy.logout();
  });
});
