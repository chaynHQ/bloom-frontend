describe('_afterAll', () => {
  after(() => {
    cy.logInWithEmailAndPassword(
      Cypress.env('CYPRESS_SUPER_ADMIN_EMAIL'),
      Cypress.env('CYPRESS_SUPER_ADMIN_PASSWORD'),
    );

    try {
      cy.deleteCypressAccessCodes();
      cy.deleteAllCypressUsers();
    } catch (error) {
      cy.log(
        `After all function failed - catching error to prevent failing tests. Error: ${error}`,
      );
    }

    cy.logout();
  });

  // Note: It is important to have at least one test to trigger the after block
  it('completes after all function', () => {
    cy.log('After all function completed - cypress users deleted');
  });
});
