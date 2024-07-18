describe('Create User', () => {
  let username = `test@test`;
  before(() => {
    cy.cleanUpTestState();
  });

  it('Should not be able to create user with incorrect email', () => {
    // Start from the home page
    cy.visit('/');
    cy.get('a[href="/auth/register"]').first().click({ force: true });
    cy.get('h2').should('contain', 'Create account');
    cy.get('#name').type('Cypress test');
    cy.get('#email').type(username);
    cy.get('#password').type('testpassword');
    cy.get('button[type="submit"]').contains('Create account').click();
    cy.get('p').should('contain', 'There was an error setting up your account');
  });
});
