describe('Therapy Usage', () => {
  let accessCode = ''; //intialise access code variable
  const newUserEmail = `cypresstestemail+${Date.now()}@chayn.co`;
  const password = 'testpassword';

  before(() => {
    cy.cleanUpTestState();
  });
  describe('A logged in partner user should be able to create an access code', () => {
    before(() => {
      cy.logInWithEmailAndPassword(
        //log in as bumble admin
        Cypress.env('bumble_partner_admin_email'),
        Cypress.env('bumble_partner_admin_password'),
      );
    });

    it('Navigate to the admin page and create the access code', () => {
      cy.visit('/');
      cy.get(`[qa-id=partner-admin-menu-button]`, { timeout: 8000 }).should('exist').click(); //Find admin button and click
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
      cy.get('button#user-menu-button').should('exist').click(); //check user menu exists and access it
      cy.get('a').contains('Apply a code').should('exist').click(); //go to the apply code page
      cy.get('input#accessCode').should('exist').click().type(accessCode); // populate the access code field
      cy.get('button[type="submit"]').contains('Apply code').click(); // submit form to add access code
      cy.get('p').contains('A Bumble code was applied to your account!').should('exist'); //check form submitted successfully
    });
  });

  describe('A new partner user should be to check how many therapy sessions are available and book therapy', () => {
    it('Check therapy is available and start to book a session', () => {
      cy.visit('/welcome/bumble');
      cy.get(`[qa-id=secondary-nav-therapy-button]`).should('exist').click(); //Find therapy button and click
      cy.get('#therapy-sessions-remaining').should('have.text', '6'); //check number of therapy sessions is 6
      cy.get('button').contains('Begin booking').should('exist').click(); //begin booking
      cy.get('iframe[title="Booking widget"]').should('exist'); //check it worked
    });

    after(() => {
      //delete access code after use to clean up. Decided to clean up after test as we do not have a way to indicate which access codes are for test cases later on
      cy.logInWithEmailAndPassword(
        Cypress.env('super_admin_email'),
        Cypress.env('super_admin_password'),
      );
    });
  });
});
