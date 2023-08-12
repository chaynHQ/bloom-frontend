describe('A partner admin should be directed to admin ', () => {
  before(() => {
    cy.cleanUpTestState();
  });

  it('Once logged in should be redirected to the admin page`', () => {
    cy.uiLogin(
      Cypress.env('bumble_partner_admin_email'),
      Cypress.env('badoo_partner_admin_password'),
    );
    cy.get('[qa-id=partner-admin-menu-button]', { timeout: 5000 }).should('exist');

    cy.get('h2').contains('Create access code').should('exist'); // We should be redirected to the create access code page
  });

  after(() => {
    cy.logout();
  });
});
