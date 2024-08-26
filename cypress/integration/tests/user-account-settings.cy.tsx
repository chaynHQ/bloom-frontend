describe('User account settings page', () => {
  const publicEmail = Cypress.env('CYPRESS_PUBLIC_EMAIL') as string;
  const publicName = Cypress.env('CYPRESS_PUBLIC_NAME') as string;

  before(() => {
    cy.cleanUpTestState();
    cy.logInWithEmailAndPassword(publicEmail, Cypress.env('CYPRESS_PUBLIC_PASSWORD'));
  });

  it('Should display disabled user email and name fields with user data', () => {
    cy.visit('/account/settings');
    cy.get('#email', { timeout: 8000 }).should('have.value', publicEmail);
    cy.get('#name').should('have.value', publicName);
  });

  it('Should have marketing and service email checkbox fields and submit button', () => {
    cy.visit('/account/settings');
    cy.get('input[name="contactPermission"]').check();
    cy.get('input[name="serviceEmailsPermission"]').check();
    cy.get('button[type="submit"]').contains('Save email preferences').click();
    cy.wait(2000);
    cy.get('input[name="contactPermission"]').should('be.checked');
    cy.get('input[name="serviceEmailsPermission"]').should('be.checked');
  });

  it('Should have email reminder frequency form and load user data', () => {
    cy.visit('/account/settings');
    cy.get('input[name="email-reminders-settings"]').eq(1).check();
    cy.get('button[type="submit"]').contains('Save email reminders').click();
    cy.wait(2000);
    cy.get('input[name="email-reminders-settings"]').eq(1).should('be.checked');
    // Reset the value to 'never' so the test works on next run
    cy.get('input[name="email-reminders-settings"]').eq(3).check();
    cy.get('button[type="submit"]').contains('Save email reminders').click();
    cy.wait(2000);
  });

  after(() => {
    cy.logout();
  });
});
