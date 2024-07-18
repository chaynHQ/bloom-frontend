describe('Create User', () => {
  let username = `cypresstestemail+${Date.now()}@chayn.co`;
  before(() => {
    cy.cleanUpTestState();
  });

  it('User should be able to create user', () => {
    // Start from the home page
    cy.visitSpanishPage('/');
    cy.get('h1').contains('Acompáñanos en tu viaje de sanación').should('exist');
    cy.get('a[href="/es/auth/register"]').first().click({ force: true });
    cy.get('h2').should('contain', 'Crea una cuenta');
    cy.get('#name').type('Cypress test');
    cy.get('#email').type(username);
    cy.get('#password').type('testpassword');
    cy.get('button[type="submit"]').contains('Crea una cuenta').click();
    cy.get('h2').should('contain', 'Ayúdanos a entender');
  });

  after(() => {
    cy.logout();
  });
});
