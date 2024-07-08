describe('Create User', () => {
  let username = `cypresstestemail+${Date.now()}@chayn.co`;
  before(() => {
    cy.cleanUpTestState();
  });

  it('Should not be able to create user with a weak password', () => {
    // Start from the home page
    cy.visit('/');
    cy.get('a[href="/auth/register"]').first().click({ force: true });
    cy.get('h2').should('contain', 'Create account');
    cy.get('#name').type('Cypress test');
    cy.get('#email').type(username);
    cy.get('#password').type('123');
    cy.get('button[type="submit"]').contains('Create account').click();
    cy.get('p').should(
      'contain',
      "Your password needs to be a little longer, so it's more secure.",
    );
  });
});
