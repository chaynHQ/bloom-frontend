describe('Create access code page should display', () => {
  before(() => {
    cy.cleanUpTestState();
    cy.logInAsTestAccount('BADOO_PARTNER_ADMIN');
  });

  beforeEach(() => {
    cy.visit('/partner-admin/create-access-code');
    cy.waitForAuthenticatedApp();
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
      .contains('Courses, messaging and 6 therapy sessions');

    cy.get('button').contains('Create access codes').should('have.prop', 'type', 'submit');
  });

  // Badoo's therapy limit is 6, like every partner that existed before the limit was added
  it('creates a therapy code with 6 sessions, stored as sent', () => {
    cy.intercept('POST', '**/partner-access').as('createAccessCode');

    cy.get('input[value="therapy"]').check();
    cy.get('button').contains('Create access codes').click();

    cy.wait('@createAccessCode').then(({ request, response }) => {
      expect(request.body).to.deep.equal({
        featureLiveChat: true,
        featureTherapy: true,
        therapySessionsRemaining: 6,
        therapySessionsRedeemed: 0,
      });
      expect(response?.statusCode).to.eq(201);
      expect(response?.body).to.include({
        featureLiveChat: true,
        featureTherapy: true,
        therapySessionsRemaining: 6,
        therapySessionsRedeemed: 0,
      });
    });

    cy.get('h3').should('contain', 'Access to courses, messaging and 6 therapy sessions');
    cy.get('#access-code-url').should('contain', '/welcome/badoo');
    cy.get('#access-code').invoke('text').should('have.length.greaterThan', 0);
  });

  after(() => {
    cy.logout();
  });
});
