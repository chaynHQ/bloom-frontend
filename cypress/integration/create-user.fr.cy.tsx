describe('Create User', () => {
  let username = `cypresstestemail+${Date.now()}@chayn.co`;
  before(() => {
    cy.cleanUpTestState();
  });

  it('User should be able to create user', () => {
    // Start from the home page
    cy.visitFrenchPage('/');
    cy.get('h1').contains('Rejoins-nous sur ton chemin de guérison').should('exist');
    cy.get('a[href="/fr/auth/register"]').first().click({ force: true });
    cy.get('h2').should('contain', 'Créer un compte');
    cy.get('#name').type('Cypress test');
    cy.get('#email').type(username);
    cy.get('#password').type('testpassword');
    cy.get('button[type="submit"]').contains('Créer un compte').click();
    cy.get('h2').should('contain', 'Aidez-nous à compendre');
  });

  after(() => {
    cy.logout();
  });
});
