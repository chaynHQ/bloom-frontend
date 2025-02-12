describe('Admin dashboard page should display', () => {
  const superAdminEmail = Cypress.env('CYPRESS_SUPER_ADMIN_EMAIL') as string;
  const superAdminPassword = Cypress.env('CYPRESS_SUPER_ADMIN_PASSWORD');
  const superAdminMFACode = Cypress.env('CYPRESS_SUPER_ADMIN_MFA_CODE');
  const adminDashboardUrl = '/admin/dashboard';

  before(() => {
    cy.cleanUpTestState();
    cy.loginAsSuperAdmin(superAdminEmail, superAdminPassword, superAdminMFACode);
  });

  beforeEach(() => {
    cy.visit(adminDashboardUrl);
  });

  it('header section', () => {
    cy.get('h2').should('contain', 'Superadmin dashboard');
  });

  it('create an admin account panel', () => {
    cy.get('h2').should('contain', 'Create an admin account');
    cy.get('p').should('contain', 'Admin accounts are able to generate therapy codes');

    cy.get('label.Mui-required').contains('Select the partner');
    cy.get('input[name="selectPartner"]').should('exist');

    cy.get('label.Mui-required').contains('Email address');
    cy.get('input[id="email"]').should('exist');

    cy.get('label.Mui-required').contains('Name');
    cy.get('input[id="name"]').should('exist');

    cy.get('button').contains('Create an admin account');
  });

  it('update therapy sessions panel', () => {
    cy.get('h2').should('contain', 'Update therapy sessions');

    cy.get('label').contains(`Type a user's email address`);
    cy.get('input[id="user-email-address-search"]').should('exist');

    cy.get('button').contains('Update therapy sessions');
  });

  it('update partner admin panel', () => {
    cy.get('h2').should('contain', 'Update partner admin');

    cy.get('label').contains('Type at least 4 letters');
    cy.get('input[id="partnerAdmin"]').should('exist');

    cy.get('button').contains('Update partner admin');
  });

  after(() => {
    cy.logout();
  });
});
