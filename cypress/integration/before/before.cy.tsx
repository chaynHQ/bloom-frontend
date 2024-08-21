describe('Initial cleanup test', () => {
  it('deletes stale cypress users before all other tests are run', () => {
    cy.logInWithEmailAndPassword(
      Cypress.env('CYPRESS_SUPER_ADMIN_EMAIL'),
      Cypress.env('CYPRESS_SUPER_ADMIN_PASSWORD'),
    );

    try {
      cy.deleteCypressAccessCodes();
      cy.deleteAllCypressUsers();
      cy.log('Before all function completed - stale cypress users deleted');
    } catch (error) {
      cy.log(
        `Before all function failed - catching error to prevent failing tests. Error: ${error}`,
      );
    }

    cy.logout();
  });
});
