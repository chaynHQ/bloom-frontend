describe('A partner admin should be directed to admin ', () => {
  before(() => {
    cy.cleanUpTestState();
  });

  it('Once logged in should be redirected to the admin page`', () => {
    cy.uiLogin(
      Cypress.env('CYPRESS_BUMBLE_PARTNER_ADMIN_EMAIL'),
      Cypress.env('CYPRESS_BUMBLE_PARTNER_ADMIN_PASSWORD'),
    );
    cy.get('[qa-id=partner-admin-menu-button]', { timeout: 10000 }).should('exist');

    cy.get('h2').contains('Create access code').should('exist'); // We should be redirected to the create access code page
  });

  after(() => {
    cy.logout();
  });
});
