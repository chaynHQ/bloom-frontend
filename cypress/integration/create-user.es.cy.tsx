describe('Create User', () => {
  let username = `cypresstestemail+${Date.now()}@chayn.co`;
  before(() => {
    cy.cleanUpTestState();
  });

  it('User should be able to create user', () => {
    // Start from the home page
    cy.visitSpanishPage('/');
    cy.get('h1', { timeout: 8000 }).contains('Acompáñanos en tu viaje de sanación').should('exist');
    cy.get('a[href="/es/auth/register"]', { timeout: 5000 }).first().click({ force: true });
    cy.get('h2', { timeout: 8000 }).should('contain', 'Crea una cuenta');
    cy.get('#name', { timeout: 8000 }).type('Cypress test');
    cy.get('#email', { timeout: 8000 }).type(username);
    cy.get('#password', { timeout: 8000 }).type('testpassword');
    cy.get('button[type="submit"]').contains('Crea una cuenta').click();
    cy.get('h2', { timeout: 8000 }).should('contain', 'Ayúdanos a entender');
  });

  after(() => {
    cy.logout();
  });
});
