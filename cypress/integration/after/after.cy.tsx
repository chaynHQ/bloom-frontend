describe('Cleanup function for after all cypress tests', () => {
  it('Should be triggered', () => {
    const superAdminEmail = Cypress.env('CYPRESS_SUPER_ADMIN_EMAIL');
    const superAdminPassword = Cypress.env('CYPRESS_SUPER_ADMIN_PASSWORD');
    const superAdminMFACode = Cypress.env('CYPRESS_SUPER_ADMIN_MFA_CODE');

    cy.loginAsSuperAdmin(superAdminEmail, superAdminPassword, superAdminMFACode);

    cy.deleteAllCypressUsers().then(() => {
      cy.log('After function completed - stale cypress users deleted');
    });
    cy.cleanUpTestState();
  });
});
