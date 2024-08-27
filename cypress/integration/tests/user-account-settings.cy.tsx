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
    cy.get('input[name="contactPermission"]', { timeout: 8000 }).check();
    cy.get('input[name="serviceEmailsPermission"]').check();
    cy.get('button[type="submit"]').contains('Save email preferences').click();
    cy.get('input[name="contactPermission"]', { timeout: 8000 }).should('be.checked');
    cy.get('input[name="serviceEmailsPermission"]').should('be.checked');
  });

  it('Should have email reminder frequency form and load user data', () => {
    const settingsIndexMap = {
      TWO_WEEKS: 0,
      ONE_MONTH: 1,
      TWO_MONTHS: 2,
      NEVER: 3,
    };

    cy.visit('/account/settings');
    // Get currently set value
    cy.get('input[name="email-reminders-settings"]:checked').then((item) => {
      const currentValue: string = item.val().toString();
      // Find the new value to be checked based on whats currently checked so tests don't fail if
      // the default settings are changed
      const newIndex = Object.values(settingsIndexMap).find((value) => {
        return settingsIndexMap[currentValue] !== value;
      });
      cy.get('h2').contains('Email reminders').should('exist');
      cy.get(`input[name="email-reminders-settings"]`).eq(newIndex).check();
      cy.get('[qa-id="email-reminders-settings-submit"]', { timeout: 20000 })
        .contains('Save email reminders')
        .should('not.be.disabled')
        .click();
      cy.get('input[name="email-reminders-settings"]').eq(newIndex).should('be.checked');
    });
  });

  after(() => {
    cy.logout();
  });
});
