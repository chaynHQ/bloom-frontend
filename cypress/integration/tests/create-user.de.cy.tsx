describe('Create User', () => {
  let username = `cypresstestemail+${Date.now()}@chayn.co`;
  before(() => {
    cy.cleanUpTestState();
  });

  it('User should be able to create user', () => {
    // Start from the home page
    cy.visitGermanPage('/');
    cy.wait(2000);
    cy.get('a[href="/de/auth/register"]', { timeout: 5000 }).first().click({ force: true });
    cy.wait(2000);
    cy.get('h2', { timeout: 8000 }).should('contain', 'Konto anlegen');
    cy.get('#name', { timeout: 8000 }).type('Cypress test');
    cy.get('#email', { timeout: 8000 }).type(username);
    cy.get('#password', { timeout: 8000 }).type('testpassword');
    cy.get('button[type="submit"]').contains('Konto anlegen').click();
    cy.wait(3000);
    cy.get('h2', { timeout: 8000 }).should('contain', 'Hilf uns, zu verstehen');
  });

  after(() => {
    cy.logout();
  });
});
