describe('Delete User', () => {
  before(() => {
    let username = `cypresstestemail+${Date.now()}@chayn.co`;
    const password = 'testpassword';
    cy.cleanUpTestState();
    cy.createUser({ emailInput: username, passwordInput: password });
    cy.logInWithEmailAndPassword(username, password);
  });
  it(`should be able to delete user from accounts settings page`, () => {
    cy.visit('/account/settings');
    cy.get('#delete-account-button', { timeout: 10000 })
      .should('contain.text', 'Delete Account')
      .click();
    cy.get('#confirm-dialog-submit', { timeout: 10000 }).click();
    cy.url({ timeout: 10000 }).should('include', '/');
  });
});
