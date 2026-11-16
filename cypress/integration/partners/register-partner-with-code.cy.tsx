// Note badoo does not have the automatic access code feature
describe('Register with access code', () => {
  let welcomeCodeLink = null;
  let welcomeCode = null;

  before(() => {
    cy.cleanUpTestState();

    cy.logInAsTestAccount('BADOO_PARTNER_ADMIN');
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
    const username = Cypress.uniqueEmail();

    // Start from the home page
    cy.visit(welcomeCodeLink);
    cy.get(`a[href="/auth/register?partner=badoo&code=${welcomeCode}"]`)
      .contains('Get started')
      .click();
    cy.wait(2000); // waiting for dom to rerender
    cy.get('h1', { timeout: 8000 }).should('contain', 'Create account');
    cy.get('#partnerAccessCode').should('have.value', welcomeCode);
    cy.get('#name').type('Cypress test');
    cy.get('#email').type(username);
    cy.get('#password').type('testpassword');
    cy.get('button[type="submit"]').contains('Create account').click();
    cy.waitForAuthenticatedApp();
    cy.get('h2', { timeout: 8000 }).should('contain', 'Help us understand');
  });
  after(() => {
    cy.logout();
  });
});

// Bumble has the automatic access code feature, but a welcome link with a code still uses the code.
describe('Register with a Bumble welcome link and code', () => {
  let bumbleCode = null;

  before(() => {
    cy.cleanUpTestState();

    cy.logInAsTestAccount('BUMBLE_PARTNER_ADMIN');
    cy.wait(2000);

    cy.createAccessCode({
      featureLiveChat: true,
      featureTherapy: false,
      therapySessionsRemaining: 0,
      therapySessionsRedeemed: 0,
    }).then((res) => {
      bumbleCode = res.body.accessCode;
    });
    cy.logout();
  });

  it('Access code should be on the register link and the form', () => {
    const username = Cypress.uniqueEmail();

    cy.visit(`/welcome/bumble?code=${bumbleCode}`);
    cy.get(`a[href="/auth/register?partner=bumble&code=${bumbleCode}"]`)
      .contains('Get started')
      .click();
    cy.wait(2000); // waiting for dom to rerender
    cy.get('h1', { timeout: 8000 }).should('contain', 'Create account');
    cy.get('#partnerAccessCode').should('have.value', bumbleCode);
    cy.get('#name').type('Cypress test');
    cy.get('#email').type(username);
    cy.get('#password').type('testpassword');
    cy.get('button[type="submit"]').contains('Create account').click();
    cy.waitForAuthenticatedApp();
    cy.get('h2', { timeout: 8000 }).should('contain', 'Help us understand');
  });

  after(() => {
    cy.logout();
  });
});
