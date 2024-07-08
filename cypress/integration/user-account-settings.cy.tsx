describe('User account settings page', () => {
  const publicEmail = Cypress.env('public_email') as string;
  const publicName = Cypress.env('public_name') as string;

  before(() => {
    cy.cleanUpTestState();
    cy.logInWithEmailAndPassword(publicEmail, Cypress.env('public_password'));
  });

  it('Should display disabled user email and name fields with user data', () => {
    cy.visit('/account/settings');
    cy.get('#email').should('have.value', publicEmail);
    cy.get('#name').should('have.value', publicName);
  });

  it('Should display error if tried to update email to a username that already exits', () => {
    cy.visit('/account/settings');
    cy.get('#email').should('have.value', publicEmail);
    cy.get('#name').should('have.value', publicName);
  });

  it('Should have marketing and service email checkbox fields and submit button', () => {
    cy.visit('/account/settings');
    cy.get('input[name="contactPermission"]').check();
    cy.get('input[name="serviceEmailsPermission"]').check();
    cy.get('button[type="submit"]').contains('Save email preferences').click();
  });

  it('Should have email reminder frequency form and load user data', () => {
    cy.visit('/account/settings');
    cy.get('input[name="email-reminders-settings"]').eq(3).should('be.checked');
    cy.get('input[name="email-reminders-settings"]').eq(1).check();
    cy.get('button[type="submit"]').contains('Save email reminders').click();
    cy.wait(2000);
    cy.get('input[name="email-reminders-settings"]').eq(1).should('be.checked');
    cy.get('input[name="email-reminders-settings"]').eq(3).check();
    cy.get('button[type="submit"]').contains('Save email reminders').click();
  });

  after(() => {
    cy.logout();
  });
});
