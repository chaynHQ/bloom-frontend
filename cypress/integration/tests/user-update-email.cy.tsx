describe('User account settings page', () => {
  const password = 'testpassword';
  let username = `cypresstestemail+${Date.now()}@chayn.co`;

  before(() => {
    cy.cleanUpTestState();
    cy.createUser({ emailInput: username, passwordInput: password });
    cy.logInWithEmailAndPassword(username, password);
  });

  it('Should successfully update name', () => {
    cy.visit('/account/settings');
    cy.get('#name', { timeout: 15000 }).clear().type('Updated name');
    cy.get('#profile-settings-submit').click();
    cy.get(`[data-testid='CheckCircleOutlinedIcon']`).should('be.visible');
  });

  it('Should display error if attempting to update email to existing email in use', () => {
    cy.visit('/account/settings');
    cy.get('#email')
      .clear()
      .type(Cypress.env('CYPRESS_PUBLIC_EMAIL') as string);
    cy.get('#profile-settings-submit').click();
    cy.get('#confirm-dialog-submit').click();
    cy.get('p')
      .contains('This email is already in use by another account, please try again')
      .should('be.visible');
  });

  it('Should successfully update email', () => {
    const newEmail = `cypresstestemail+${Date.now()}@chayn.co`;
    cy.visit('/account/settings');
    cy.get('#email').clear().type(newEmail);
    cy.get('#profile-settings-submit').click();
    cy.get('#confirm-dialog-submit').click();
    cy.url().should('include', '/auth/login');
    cy.get('h1').contains('Welcome back');
    cy.get('#email').type(newEmail);
    cy.get('#password').type(password);
    cy.get('#login-submit').click();

    cy.get('#email').should('have.value', newEmail);
  });
  after(() => {
    cy.logout();
  });
});
