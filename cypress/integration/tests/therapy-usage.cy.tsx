describe('Therapy Usage', () => {
  let accessCode = ''; //intialise access code variable
  const newUserEmail = `cypresstestemail+${Date.now()}@chayn.co`;
  const password = 'testpassword';

  before(() => {
    cy.cleanUpTestState();
  });

  describe('A logged in partner admin should be able to create an access code', () => {
    before(() => {
      cy.logInWithEmailAndPassword(
        Cypress.env('CYPRESS_BUMBLE_PARTNER_ADMIN_EMAIL'),
        Cypress.env('CYPRESS_BUMBLE_PARTNER_ADMIN_PASSWORD'),
      );
    });

    it('Navigate to the admin page and create the access code', () => {
      cy.visit('/');
      cy.get(`[qa-id=partner-admin-menu-button]`, { timeout: 10000 }).should('exist').click(); //Find admin button and click
      cy.uiCreateAccessCode().then((res) => {
        accessCode = res;
      });
    });
  });

  describe('A new partner user should be able to apply the access code', () => {
    before(() => {
      cy.createUser({
        //create test user
        emailInput: newUserEmail,
        passwordInput: password,
      });
      cy.logInWithEmailAndPassword(newUserEmail, password); //log in to test user
    });

    it('Log in as new bumble user and apply code', () => {
      cy.visit('/welcome/bumble');
      cy.get('button#user-menu-button', { timeout: 10000 }).should('exist').click(); //check user menu exists and access it
      cy.get('a').contains('Apply a code').should('exist').click(); //go to the apply code page
      cy.get('input#accessCode').should('exist').click().type(accessCode); // populate the access code field
      cy.get('button[type="submit"]').contains('Apply code').click(); // submit form to add access code
      cy.get('p', { timeout: 10000 })
        .contains('A Bumble code was applied to your account!')
        .should('exist'); //check form submitted successfully
    });
    it('Check therapy is available and start to book a session', () => {
      cy.visit('/welcome/bumble');
      cy.get(`[qa-id=secondary-nav-therapy-button]`, { timeout: 10000 }).should('exist').click(); //Find therapy button and click
      cy.get('#therapy-sessions-remaining').should('have.text', '6'); //check number of therapy sessions is 6
      cy.get('button').contains('Begin booking').should('exist').click(); //begin booking
      cy.get('iframe[title="Booking widget"]').should('exist'); //check it worked
    });
  });
});
