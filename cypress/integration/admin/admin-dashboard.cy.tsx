describe.skip('Admin dashboard page should display', () => {
  const adminDashboardUrl = '/admin/dashboard';

  before(() => {
    cy.cleanUpTestState();
    cy.logInAsTestAccount('SUPER_ADMIN');
  });

  beforeEach(() => {
    cy.visit(adminDashboardUrl);
  });

  it('header section', () => {
    cy.get('h1').should('contain', 'Superadmin dashboard');
  });

  it('create partner admin panel', () => {
    cy.get('h2').should('contain', 'Create partner admin');
    cy.get('p').should(
      'contain',
      "Partner admins can create access codes for their partner's members.",
    );

    cy.get('label.Mui-required').contains('Select partner');
    cy.get('input[name="selectPartner"]').should('exist');

    cy.get('label.Mui-required').contains('Email address');
    cy.get('input[id="email"]').should('exist');

    cy.get('label.Mui-required').contains('Name');
    cy.get('input[id="name"]').should('exist');

    cy.get('button').contains('Create partner admin');
  });

  it('update therapy sessions panel', () => {
    cy.get('h2').should('contain', 'Update therapy sessions');

    cy.get('label').contains(`Search by user email`);
    cy.get('input[id="user-email-address-search"]').should('exist');

    cy.get('button').contains('Update therapy sessions');
  });

  it('update partner admin panel', () => {
    cy.get('h2').should('contain', 'Update partner admin');

    cy.get('label').contains('Search by admin email');
    cy.get('input[id="partnerAdmin"]').should('exist');

    cy.get('button').contains('Update partner admin');
  });

  after(() => {
    cy.logout();
  });
});
