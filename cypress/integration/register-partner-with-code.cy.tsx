// Note badoo does not have the automatic access code feature
describe('Register with access code', () => {
  let welcomeCodeLink = null;
  let welcomeCode = null;
  let username = `cypresstestemail+${Date.now()}@chayn.co`;
  before(() => {
    cy.cleanUpTestState();

    cy.logInWithEmailAndPassword(
      Cypress.env('badoo_partner_admin_email'),
      Cypress.env('badoo_partner_admin_password'),
    );

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

  it('Access code input should be on form', () => {
    // Start from the home page
    cy.visit(welcomeCodeLink);
    cy.wait(2000);
    // The new page should contain an h2 with "Reset your password"
    cy.get('p').contains(
      'Enter the access code you received from Badoo to begin your Bloom journey.',
    );
    cy.get('#accessCode')
      .invoke('val')
      .then((val) => expect(val).equals(welcomeCode));
    cy.get('button[type="submit"]').contains('Get started').click(); // waiting for dom to rerender
    cy.get('h2').should('contain', 'Create account');
    cy.get('#name').type('Cypress test');
    cy.get('#email').type(username);
    cy.get('#password').type('testpassword');
    cy.get('button[type="submit"]').contains('Create account').click();
    cy.get('h2').should('contain', 'Help us understand');
  });
  after(() => {
    cy.logout();
  });
});
