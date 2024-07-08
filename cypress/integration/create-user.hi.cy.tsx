describe('Create User', () => {
  let username = `cypresstestemail+${Date.now()}@chayn.co`;
  before(() => {
    cy.cleanUpTestState();
  });

  it('User should be able to create account in hindi', () => {
    // Start from the home page
    cy.visitHindiPage('/');

    cy.get('a[href="/hi/auth/register"]').first().click({ force: true });
    cy.get('h2').should('contain', 'Account banaiye');
    cy.get('#name').type('Cypress test');
    cy.get('#email').type(username);
    cy.get('#password').type('testpassword');
    cy.get('button[type="submit"]').contains('Account Banao').click();
  });

  after(() => {
    cy.logout();
  });
});
