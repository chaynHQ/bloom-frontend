describe('Initial cleanup test', () => {
  it('deletes stale cypress users before all other tests are run', () => {
    cy.logInWithEmailAndPassword(
      Cypress.env('CYPRESS_SUPER_ADMIN_EMAIL'),
      Cypress.env('CYPRESS_SUPER_ADMIN_PASSWORD'),
    ).then(() => {
      cy.deleteCypressAccessCodes();
      cy.deleteAllCypressUsers().then(() => {
        cy.log('Before all function completed - stale cypress users deleted');
      });

      cy.logout();
    });
  });
});
