// Note badoo does not have the automatic access code feature
describe('Register with access code', () => {
  let welcomeCodeLink = null;
  let welcomeCode = null;
  let username = `cypresstestemail+${Date.now()}@chayn.co`;

  before(() => {
    cy.cleanUpTestState();

    cy.logInWithEmailAndPassword(
      Cypress.env('CYPRESS_BADOO_PARTNER_ADMIN_EMAIL'),
      Cypress.env('CYPRESS_BADOO_PARTNER_ADMIN_PASSWORD'),
    );
    cy.wait(2000);

    cy.createAccessCode({
      featureLiveChat: true,
      featureTherapy: true,
      therapySessionsRemaining: 6,
      therapySessionsRedeemed: 0,
    }).then((res) => {
      welcomeCode = res.body.accessCode;
      welcomeCodeLink = `/welcome/badoo?code=${res.body.accessCode}`;
    });
    cy.logout();
  });

  it('Access code should be on first register button link', () => {
    // Start from the home page
    cy.visit(welcomeCodeLink);
    cy.get(`a[href="/auth/register?partner=badoo&code=${welcomeCode}"]`)
      .contains('Get started')
      .click();
    cy.wait(2000); // waiting for dom to rerender
    cy.get('h2', { timeout: 8000 }).should('contain', 'Create account');
    cy.get('#partnerAccessCode').should('contain', welcomeCode);
    cy.get('#name').type('Cypress test');
    cy.get('#email').type(username);
    cy.get('#password').type('testpassword');
    cy.get('button[type="submit"]').contains('Create account').click();
    cy.wait(4000); // Waiting for dom to rerender
    cy.get('h2', { timeout: 8000 }).should('contain', 'Help us understand');
  });
  after(() => {
    cy.logout();
  });
});
