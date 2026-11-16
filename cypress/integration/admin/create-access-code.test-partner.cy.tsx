// There's no Test Partner admin account, so this signs in as Badoo's admin and swaps in Test
// Partner (therapy limit 0) as the admin's partner. Creating a code is stubbed, because the
// backend would create it for the signed-in admin's real partner.
describe('Create access code page for a partner without therapy', () => {
  before(() => {
    cy.cleanUpTestState();
  });

  beforeEach(() => {
    cy.logInAsTestAccount('BADOO_PARTNER_ADMIN');
    cy.request(`${Cypress.expose('NEXT_PUBLIC_API_URL')}/partner/test-partner`).then(
      ({ body: testPartner }) => {
        expect(testPartner.therapySessionsPerCode).to.eq(0);
        cy.intercept('GET', '**/user/me', (req) => {
          req.continue((res) => {
            res.body.partnerAdmin.partner = testPartner;
          });
        });
      },
    );
    cy.visit('/partner-admin/create-access-code');
    cy.waitForAuthenticatedApp();
  });

  it('offers no therapy option', () => {
    cy.get('legend').contains('Select support type offered to this user');
    cy.get('input[value="therapy"]').should('not.exist');
    cy.get('form').should('not.contain', 'therapy');
    cy.get('input[type="radio"]')
      .should('have.length', 1)
      .parents('label')
      .contains('Courses and messaging');
  });

  it('creates a code without therapy and links to its welcome page by slug', () => {
    cy.intercept('POST', '**/partner-access', {
      statusCode: 201,
      body: { accessCode: 'CYP123' },
    }).as('createAccessCode');

    cy.get('input[type="radio"]').check();
    cy.get('button').contains('Create access codes').click();

    cy.wait('@createAccessCode').its('request.body').should('deep.equal', {
      featureLiveChat: true,
      featureTherapy: false,
      therapySessionsRemaining: 0,
      therapySessionsRedeemed: 0,
    });

    cy.get('h3').should('contain', 'Access to courses and messaging');
    cy.get('#access-code-url').should('contain', '/welcome/test-partner');
    cy.get('#access-code').should('have.text', 'CYP123');
  });

  afterEach(() => {
    cy.logout();
  });
});
