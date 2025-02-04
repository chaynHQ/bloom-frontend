// Note Bumble has automatic access code feature
describe('Register without access code', () => {
  let username = `cypresstestemail+${Date.now()}@chayn.co`;
  before(() => {
    cy.cleanUpTestState();
  });

  it('Access code input should not be on form and correct courses should be available', () => {
    // Start from the home page
    cy.visit('/welcome/bumble');
    cy.get('a', { timeout: 8000 }).contains('Get started').click();
    cy.wait(2000); // waiting for dom to rerender
    cy.get('h2', { timeout: 8000 }).should('contain', 'Create account');
    cy.get('#name').type('Cypress test');
    cy.get('#email').type(username);
    cy.get('#password').type('testpassword');
    cy.get('button[type="submit"]').contains('Create account').click();
    cy.wait(4000); // Waiting for dom to rerender
    cy.get('h2', { timeout: 8000 }).should('contain', 'Help us understand');
    cy.get('a').contains('Skip').click();
    cy.wait(2000); // Waiting for dom to rerender
    cy.get('h3').contains('Dating, boundaries, and relationships').click();
    cy.get('h3').contains('What are boundaries').click();
  });

  after(() => {
    cy.logout();
  });
});
