describe('Therapy Usage', () => {
  let accessCode = ''; //intialise access code variable
  const newUserEmail = `cypresstestuser+${Date.now()}@chayn.co`;
  const password = 'testpassword';

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
        accessCode = elem.text();
      });
    cy.logout();
  });

  after(() => {
    cy.logout();
  });

  // This test verifies the application of a new code for a new user
  it('Log in as a new user, apply code, and check therapy is available', () => {
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

    // Navigate to therapy page and check sessions are there
    cy.visit('/welcome/bumble');
    cy.get(`[qa-id=secondary-nav-therapy-button]`).should('exist').click(); //Find therapy button and click
    cy.url().should('include', '/therapy/book-session');
    cy.get('#therapy-sessions-remaining').should('be.visible').and('have.text', '6'); //check number of therapy sessions is 6
  });

  it('Should load the therapy page and display main content sections', () => {
    cy.visit('/therapy/book-session');

    // Check Header elements
    cy.get('h1').should('be.visible').and('have.text', 'Book therapy'); // Assuming H1 is the main title

    // Check Booking Button state (should be enabled if sessions > 0)
    cy.get('button').contains('Begin booking').should('be.visible').and('be.enabled');

    // Check Sessions Remaining
    cy.get('#therapy-sessions-remaining').should('be.visible').and('contain.text', '6'); // Check for '6' sessions

    // Check Booking Steps Section Title
    cy.get('#booking-steps-section').within(() => {
      cy.get('h2').should('be.visible').and('have.text', 'How booking works');
    });

    // Check Therapist Section Title
    cy.get('#therapist-profiles-section').within(() => {
      cy.get('h2').should('be.visible').and('have.text', 'Our therapy team');
    });

    // Check FAQs Section Title
    cy.get('main').contains('h2', 'More about the therapy').should('be.visible');

    // Check initial state - modal should be closed
    cy.get('.MuiModal-root').should('not.exist');
  });

  it('Should open the booking modal and display the Simplybook widget iframe', () => {
    cy.visit('/therapy/book-session');

    cy.get('button').contains('Begin booking').click();

    // Check modal is open and visible
    cy.get('.MuiModal-root').should('be.visible');
    cy.get('button[aria-label="Close booking widget"]').should('be.visible');
    cy.get('.MuiModal-root').find('#simplybook-widget-container').should('be.visible');

    // Check iframe exists within the container (indicates widget loaded successfully)
    cy.get('#simplybook-widget-container')
      .find('iframe.sb-widget-iframe', { timeout: 10000 })
      .should('be.visible');
  });
});
