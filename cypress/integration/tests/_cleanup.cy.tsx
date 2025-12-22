// This file runs first (alphabetically) to clean up stale test users before the test suite
// This ensures tests start with a clean state

describe('Pre-test cleanup', () => {
  it('should delete all stale cypress test users', () => {
    const superAdminEmail = Cypress.env('CYPRESS_SUPER_ADMIN_EMAIL');
    const superAdminPassword = Cypress.env('CYPRESS_SUPER_ADMIN_PASSWORD');

    if (!superAdminEmail || !superAdminPassword) {
      cy.log('Skipping cleanup - super admin credentials not configured');
      return;
    }

    cy.logInWithEmailAndPassword(superAdminEmail, superAdminPassword);
    cy.deleteAllCypressUsers();
    cy.log('Pre-test cleanup completed - stale cypress users deleted');
  });
});
