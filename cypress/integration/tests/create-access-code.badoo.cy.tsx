describe('Create access code page should display', () => {
  const badooEmail = Cypress.env('CYPRESS_BADOO_PARTNER_ADMIN_EMAIL') as string;
  const badooPassword = Cypress.env('CYPRESS_BADOO_PARTNER_ADMIN_PASSWORD');

  before(() => {
    cy.cleanUpTestState();
    cy.logInWithEmailAndPassword(badooEmail, badooPassword);
  });

  beforeEach(() => {
    cy.visit('/partner-admin/create-access-code');
  });

  it('header section', () => {
    cy.get('h2').should('contain', 'Create access codes');
    cy.checkImage('Badoo logo', 'badoo_logo');
  });

  it('Create access codes panel', () => {
    cy.get('h2').should('contain', 'Create access codes');
    cy.get('p').should(
      'contain',
      'Use this form to create an access code every time you want to give someone access to Bloom.',
    );

    cy.get('legend').contains('Select support type offered to this user');
    cy.get('input')
      .should('exist')
      .should('have.prop', 'type', 'radio')
      .should('have.value', 'therapy')
      .parents('label')
      .contains('Courses, messaging and six therapy sessions');

    cy.get('button').contains('Create access codes').should('have.prop', 'type', 'submit');
  });

  after(() => {
    cy.logout();
  });
});
