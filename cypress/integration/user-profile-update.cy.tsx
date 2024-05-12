describe('User should be able to see his profile data in settings', () => {
  const publicEmail = Cypress.env('public_email')

  before(() => {
    cy.cleanUpTestState();
    cy.logInWithEmailAndPassword(publicEmail, Cypress.env('public_password'));
  });

  it('Navigate to the account settings page', () => {
    cy.visit('/account/settings');
    cy.get('#email', { timeout: 10000 }).should('be.disabled')
    cy.wait(3000);
  });

  after(() => {
    cy.logout();
  });
});
