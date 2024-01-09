describe('_beforeAll', () => {
  before(() => {
    cy.logInWithEmailAndPassword(
      Cypress.env('super_admin_email'),
      Cypress.env('super_admin_password'),
    );
    cy.deleteCypressAccessCodes();
    cy.deleteAllCypressUsers();
    cy.logout();
  });

  // Note: It is important to have at least one test to trigger the before block
  it('completes before all function', () => {
    cy.log('Before all function completed');
  });
});
