describe('Create User', () => {
  let username = `cypresstestemail+${Date.now()}@chayn.co`;
  before(() => {
    cy.cleanUpTestState();
  });

  it('User should be able to create user', () => {
    // Start from the home page
    cy.visitPortuguesePage('/');
    cy.wait(2000);
    cy.get('a[href="/pt/auth/register"]', { timeout: 5000 }).first().click({ force: true });
    cy.wait(2000);
    cy.get('h2', { timeout: 8000 }).should('contain', 'Criar uma conta');
    cy.get('#name', { timeout: 8000 }).type('Cypress test');
    cy.get('#email', { timeout: 8000 }).type(username);
    cy.get('#password', { timeout: 8000 }).type('testpassword');
    cy.get('button[type="submit"]').contains('Criar uma conta').click();
    cy.wait(3000);
    cy.get('h2', { timeout: 8000 }).should('contain', 'Ajude-nos a entender');
  });

  after(() => {
    cy.logout();
  });
});
