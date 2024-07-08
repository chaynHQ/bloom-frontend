describe('User account settings page', () => {
  beforeEach(() => {
    let username = `cypresstestemail+${Date.now()}@chayn.co`;
    const password = 'testpassword';
    cy.cleanUpTestState();
    cy.createUser({ emailInput: username, passwordInput: password });
    cy.logInWithEmailAndPassword(username, password);
  });

  it('Should display disabled update name successfully', () => {
    cy.visit('/account/settings');
    cy.get('#name', { timeout: 10000 }).clear().type('Updated name');
    cy.get('#profile-settings-submit', { timeout: 10000 }).click();
    cy.get(`[data-testid='CheckCircleOutlinedIcon']`, { timeout: 10000 }).should('be.visible');
  });

  it('Should display error if email alreadyInuse', () => {
    cy.visit('/account/settings');
    cy.get('#email', { timeout: 10000 })
      .clear()
      .type(Cypress.env('public_email') as string);
    cy.get('#profile-settings-submit', { timeout: 10000 }).click();
    cy.get('#confirm-dialog-submit', { timeout: 10000 }).click();
    cy.get('p', { timeout: 10000 })
      .contains('This email is already in use by another account, please try again')
      .should('be.visible');
  });

  it('Should successfully change email', () => {
    const newEmail = `cypresstestemail+${Date.now()}@chayn.co`;
    cy.visit('/account/settings');
    cy.get('#email', { timeout: 10000 }).clear().type(newEmail);
    cy.get('#profile-settings-submit', { timeout: 10000 }).click();
    cy.get('#confirm-dialog-submit', { timeout: 10000 }).click();
    cy.url({ timeout: 10000 }).should('include', '/auth/login');
    cy.get('#email').type(newEmail);
    cy.get('#password').type(password);
    cy.get('#login-submit', { timeout: 10000 }).click();

    cy.get('#email', { timeout: 10000 }).should('have.value', newEmail);
  });
  after(() => {
    cy.logout();
  });
});
