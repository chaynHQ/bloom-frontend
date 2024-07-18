describe('Create User', () => {
  let username = Cypress.env('super_admin_email');
  before(() => {
    cy.cleanUpTestState();
  });

  it('Should not be able to create user with existing email', () => {
    // Start from the home page
    cy.visit('/');
    cy.get('a[href="/auth/register"]').first().click({ force: true });
    cy.get('h2').should('contain', 'Create account');
    cy.get('#name').type('Cypress test');
    cy.get('#email').type(username);
    cy.get('#password').type('testpassword');
    cy.get('button[type="submit"]').contains('Create account').click();
    cy.get('p').should('contain', 'This email is already registered with Bloom');
  });
});
