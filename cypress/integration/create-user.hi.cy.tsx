describe('Create User', () => {
  let username = `cypresstestemail+${Date.now()}@chayn.co`;
  before(() => {
    cy.cleanUpTestState();
  });

  it('User should be able to create account in hindi', () => {
    // Start from the home page
    cy.visitHindiPage('/');

    cy.get('a[href="/hi/auth/register"]', { timeout: 5000 }).first().click({ force: true });
    cy.get('h2', { timeout: 8000 }).should('contain', 'Account banaiye');
    cy.get('#name', { timeout: 8000 }).type('Cypress test');
    cy.get('#email', { timeout: 8000 }).type(username);
    cy.get('#password', { timeout: 8000 }).type('testpassword');
    cy.get('button[type="submit"]').contains('Account Banao').click();
  });

  after(() => {
    cy.logout();
  });
});
