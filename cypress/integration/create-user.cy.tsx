// Note bumble is does not have the automatic access code feature

describe('Create User', () => {
  let username = `cypresstestemail+${Date.now()}@chayn.co`;
  before(() => {
    cy.cleanUpTestState();
  });

  it('User should be able to create user', () => {
    // Start from the home page
    cy.visit('/');
    // TODO put the correct home page check below when it is published
    // cy.get('h2', { timeout: 8000 }).contains('Get started').should('exist');
    // TODO - workout why #primary-get-started-button works locallly and headless but not in github actions
    cy.get('a[href="/auth/register"]', { timeout: 10000 }).first().click({ force: true });
    cy.get('h2', { timeout: 10000 }).should('contain', 'Create account');
    cy.get('#name', { timeout: 10000 }).type('Cypress test');
    cy.get('#email', { timeout: 10000 }).type(username);
    cy.get('#password', { timeout: 10000 }).type('testpassword');
    cy.get('button[type="submit"]').contains('Create account').click();
    cy.get('h2', { timeout: 10000 }).should('contain', 'Help us understand');
  });
  after(() => {
    cy.logout();
  });
});
