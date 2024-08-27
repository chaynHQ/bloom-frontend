describe('Final cleanup test', () => {
  it('deletes new cypress users after all tests are run', () => {
    cy.logInWithEmailAndPassword(
      Cypress.env('CYPRESS_SUPER_ADMIN_EMAIL'),
      Cypress.env('CYPRESS_SUPER_ADMIN_PASSWORD'),
    );

    // try {
    //   cy.deleteCypressAccessCodes();
    //   cy.deleteAllCypressUsers();
    //   cy.log('After all function completed - new cypress users deleted');
    // } catch (error) {
    //   cy.log(
    //     `After all function failed - catching error to prevent failing tests. Error: ${error}`,
    //   );
    // }

    cy.logout();
  });
});
