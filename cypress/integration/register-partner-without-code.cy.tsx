// Note Bumble has automatic access code feature
describe('Register without access code', () => {
  let username = `cypresstestemail+${Date.now()}@chayn.co`;
  before(() => {
    cy.cleanUpTestState();
  });

  it('Access code input should be on form', () => {
    // Start from the home page
    cy.visit('/welcome/bumble');
    cy.wait(5000);
    cy.get('p')
      .contains('Enter the access code you received from Bumble to begin your Bloom journey.')
      .should('not.exist');
    cy.get('p').contains(
      'Create an account with Bloom to get started with our courses, or first find out more about Bloom below.',
    );
    cy.get('a', { timeout: 5000 }).contains('Get started').click();
    cy.wait(2000); // waiting for dom to rerender
    cy.get('h2', { timeout: 5000 }).should('contain', 'Create account');
    cy.get('#name').type('Cypress test');
    cy.get('#email').type(username);
    cy.get('#password').type('testpassword');
    cy.get('button[type="submit"]').contains('Create account').click();
    cy.wait(4000); // Waiting for dom to rerender
    cy.get('h2', { timeout: 5000 }).should('contain', 'Help us understand');
  });
  after(() => {
    cy.logout();
  });
});
