describe('Therapy Usage', () => {
  let accessCode = ''; //intialise access code variable
  const newUserEmail = `cypresstestemail+${Date.now()}@chayn.co`;
  const password = 'testpassword';

  describe('A new partner user should be able to apply the access code', () => {
    before(() => {
      // create a partner access code with therapy
      cy.logInWithEmailAndPassword(
        Cypress.env('CYPRESS_BUMBLE_PARTNER_ADMIN_EMAIL'),
        Cypress.env('CYPRESS_BUMBLE_PARTNER_ADMIN_PASSWORD'),
      );
      cy.visit('/partner-admin/create-access-code');
      cy.get('input[type="radio"]').should('exist').check('therapy'); //select radio button on form
      cy.get('button[type="submit"]').contains('Create access code').click(); // submit form to create access code
      cy.get('#access-code')
        .should('exist') //wait for result to exist in dom then get the access code
        .then((elem) => {
          //get the access code
          accessCode = elem.text();
        });
      cy.logout();
    });

    it('Log in as a user and apply code', () => {
      cy.cleanUpTestState();
      cy.createUser({
        emailInput: newUserEmail,
        passwordInput: password,
      });
      cy.logInWithEmailAndPassword(newUserEmail, password); //log in to test user
      cy.visit('/welcome/bumble');
      cy.get('button#user-menu-button').should('exist').click(); //check user menu exists and access it
      cy.get('a').contains('Apply a code').should('exist').click(); //go to the apply code page
      cy.get('input#accessCode').should('exist').click().type(accessCode); // populate the access code field
      cy.get('button[type="submit"]').contains('Apply code').click(); // submit form to add access code
      cy.get('p').contains('A Bumble code was applied to your account!').should('exist'); //check form submitted successfully
    });
    it('Check therapy is available and start to book a session', () => {
      cy.visit('/welcome/bumble');
      cy.get(`[qa-id=secondary-nav-therapy-button]`).should('exist').click(); //Find therapy button and click
      cy.get('#therapy-sessions-remaining').should('have.text', '6'); //check number of therapy sessions is 6
      cy.get('button').contains('Begin booking').should('exist').click(); //begin booking
      cy.get('iframe[title="Booking widget"]').should('exist'); //check it worked
    });
  });
});
