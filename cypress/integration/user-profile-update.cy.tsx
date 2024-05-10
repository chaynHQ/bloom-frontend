describe('User should be able to update his profile', () => {
  const publicEmail = Cypress.env("public_email")

  const date = Date.now()
  const tempEmail = `cypresstestemail+${date}@chayn.co`;
  const tempName = `cypresstestname+${date}`;

  before(() => {
    cy.cleanUpTestState();
    cy.logInWithEmailAndPassword(publicEmail, Cypress.env('public_password'));
  });

  it('Navigate to the account settings page and update profile details', () => {
    cy.visit('/account/settings');
    cy.get('#name', { timeout: 10000 }).clear().type(tempName);
    cy.get('#email', { timeout: 10000 }).clear().type(tempEmail);
    cy.get('button[type="submit"]').contains('Save Profile').click();
    cy.wait(3000);
  });

  it('Reset the email back to public one', () => {
    cy.visit('/account/settings');
    cy.get('#name', { timeout: 10000 }).clear().type("New Name");
    cy.get('#email', { timeout: 10000 }).clear().type(publicEmail);
    cy.get('button[type="submit"]').contains('Save Profile').click();
    cy.wait(3000);
  });

  after(() => {
    cy.logout();
  });
});
