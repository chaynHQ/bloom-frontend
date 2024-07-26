describe('Create User', () => {
  let username = `cypresstestemail+${Date.now()}@chayn.co`;
  before(() => {
    cy.cleanUpTestState();
  });

  it('User should be able to create user', () => {
    // Start from the home page
    cy.visitFrenchPage('/');
    cy.wait(2000);
    cy.get('h1', { timeout: 8000 })
      .contains('Rejoins-nous sur ton chemin de guérison')
      .should('exist');
    cy.get('a[qa-id="primary-get-started-button"]', { timeout: 5000 })
      .first()
      .click({ force: true });
    cy.wait(2000);
    cy.get('h2', { timeout: 8000 }).should('contain', 'Créer un compte');
    cy.get('#name', { timeout: 8000 }).type('Cypress test');
    cy.get('#email', { timeout: 8000 }).type(username);
    cy.get('#password', { timeout: 8000 }).type('testpassword');
    cy.get('button[type="submit"]').contains('Créer un compte').click();
    cy.wait(3000);
    cy.get('h2', { timeout: 8000 }).should('contain', 'Aidez-nous à compendre');
  });

  after(() => {
    cy.logout();
  });
});
