describe('Create User', () => {
  let username = `cypresstestemail+${Date.now()}@chayn.co`;
  before(() => {
    cy.cleanUpTestState();
  });

  it('User should be able to create user', () => {
    // Start from the home page
    cy.visitGermanPage('/');
    cy.get('h1').contains('Begleite uns während deines Heilungsprozesses').should('exist');
    cy.get('a[href="/de/auth/register"]').first().click({ force: true });
    cy.get('h2').should('contain', 'Konto anlegen');
    cy.get('#name').type('Cypress test');
    cy.get('#email').type(username);
    cy.get('#password').type('testpassword');
    cy.get('button[type="submit"]').contains('Konto anlegen').click();
    cy.get('h2').should('contain', 'Hilf uns, zu verstehen');
  });

  after(() => {
    cy.logout();
  });
});
