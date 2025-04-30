describe('Therapy Usage', () => {
  let accessCode = ''; // Initialize access code variable
  const newUserEmail = `cypresstestuser+${Date.now()}@chayn.co`;
  const password = 'testpassword';

  before(() => {
    // create a partner access code with therapy
    cy.logInWithEmailAndPassword(
      Cypress.env('CYPRESS_BUMBLE_PARTNER_ADMIN_EMAIL'),
      Cypress.env('CYPRESS_BUMBLE_PARTNER_ADMIN_PASSWORD'),
    );
    cy.visit('/partner-admin/create-access-code');
    cy.get('input[type="radio"]').should('exist').check('therapy'); // Select radio button on form
    cy.get('button[type="submit"]').contains('Create access code').click(); // Submit form to create access code
    cy.get('#access-code')
      .should('exist') // Wait for result to exist in dom then get the access code
      .then((elem) => {
        accessCode = elem.text();
      });
    cy.logout();

    // Create and log in the new user
    cy.cleanUpTestState();
    cy.createUser({
      emailInput: newUserEmail,
      passwordInput: password,
    });
    cy.logInWithEmailAndPassword(newUserEmail, password); // Log in to test user
    cy.visit('/welcome/bumble');
    cy.get('button#user-menu-button').should('exist').click(); // Check user menu exists and access it
    cy.get('a').contains('Apply a code').should('exist').click(); // Go to the apply code page
    cy.get('input#accessCode').should('exist').click().type(accessCode); // Populate the access code field
    cy.get('button[type="submit"]').contains('Apply code').click(); // Submit form to add access code
    cy.get('p').contains('A Bumble code was applied to your account!').should('exist'); // Check form submitted successfully

    // Navigate to therapy page
    cy.visit('/therapy/book-session');
    cy.get(`[qa-id=secondary-nav-therapy-button]`).should('exist').click(); // Find therapy button and click
    cy.url().should('include', '/therapy/book-session');
    cy.get('#therapy-sessions-remaining').should('be.visible').and('have.text', '6'); // Check number of therapy sessions is 6
    cy.logout(); // Log out after setup, individual tests will log back in
  });

  beforeEach(() => {
    cy.logInWithEmailAndPassword(newUserEmail, password); // Log in before each test
    cy.visit('/therapy/book-session'); // Ensure we are on the therapy page for each test
  });

  after(() => {
    cy.logout();
  });

  it('Should load the therapy page and display main content sections', () => {
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

  it('Should display a therapy booking item with all relevant data', () => {
    cy.intercept('GET', '/api/v1/therapy-session', [
      {
        id: 'test-session-1',
        action: 'NEW_BOOKING',
        clientTimezone: 'Europe/London',
        serviceName: 'Individual Therapy Session',
        serviceProviderName: 'Test Therapist',
        startDateTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        endDateTime: new Date(Date.now() + 90000000).toISOString(),
        cancelledAt: null,
        rescheduledFrom: null,
        completedAt: null,
        partnerAccessId: 'test-access-id',
      },
    ]).as('getTherapySessions');
    cy.reload();
    cy.wait('@getTherapySessions');

    cy.get('[data-testid="therapy-booking-item"]').should('exist');
    cy.get('[data-testid="therapy-booking-item"]')
      .contains('Upcoming Session')
      .should('be.visible');
    cy.get('[data-testid="therapy-booking-item"]').contains('Test Therapist').should('be.visible');
  });

  it('Should allow expanding and collapsing a therapy booking item and display details', () => {
    cy.intercept('GET', '/api/v1/therapy-session', [
      {
        id: 'test-session-1',
        action: 'NEW_BOOKING',
        clientTimezone: 'Europe/London',
        serviceName: 'Individual Therapy Session',
        serviceProviderName: 'Test Therapist',
        startDateTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        endDateTime: new Date(Date.now() + 90000000).toISOString(),
        cancelledAt: null,
        rescheduledFrom: null,
        completedAt: null,
        partnerAccessId: 'test-access-id',
      },
    ]).as('getTherapySessions');
    cy.reload();
    cy.wait('@getTherapySessions');

    cy.get('[data-testid="therapy-booking-item"]').should('exist').click();
    cy.get('[data-testid="therapy-booking-item"]').contains('Date:').should('be.visible');
    cy.get('[data-testid="therapy-booking-item"]').contains('Time:').should('be.visible');
    cy.get('[data-testid="therapy-booking-item"]')
      .contains('Therapist: Test Therapist')
      .should('be.visible');
    cy.get('[data-testid="therapy-booking-item"]').click();
    cy.get('[data-testid="therapy-booking-item"]').contains('Date:').should('not.be.visible');
  });

  it('Should open and close the cancel confirmation dialog for an upcoming session', () => {
    cy.intercept('GET', '/api/v1/therapy-session', [
      {
        id: 'upcoming-session',
        action: 'NEW_BOOKING',
        clientTimezone: 'Europe/London',
        serviceName: 'Individual Therapy Session',
        serviceProviderName: 'Test Therapist',
        startDateTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        endDateTime: new Date(Date.now() + 90000000).toISOString(),
        cancelledAt: null,
        rescheduledFrom: null,
        completedAt: null,
        partnerAccessId: 'test-access-id',
      },
    ]).as('getTherapySessions');
    cy.reload();
    cy.wait('@getTherapySessions');

    cy.get('[data-testid="therapy-booking-item"]')
      .contains('Upcoming Session')
      .should('exist')
      .click();
    cy.get('[data-testid="therapy-booking-item"]').find('button').contains('Cancel').click();
    cy.get('[role="dialog"]').should('be.visible').and('contain', 'Confirm Cancellation');
    cy.get('[role="dialog"]').find('button').contains('Keep Session').click();
    cy.get('[role="dialog"]').should('not.exist');

    cy.get('[data-testid="therapy-booking-item"]').contains('Upcoming Session').click();
    cy.get('[data-testid="therapy-booking-item"]').find('button').contains('Cancel').click();
    cy.get('[role="dialog"]').should('be.visible').and('contain', 'Confirm Cancellation');
    cy.get('[role="dialog"]').find('button').contains('Cancel Session').click();

    cy.wait('@cancelTherapySession').its('response.statusCode').should('eq', 200);
    cy.get('[data-testid="therapy-booking-item"]').should('not.contain', 'Upcoming Session');
    cy.get('[data-testid="therapy-booking-item"]')
      .contains('Cancelled Session')
      .should('be.visible');
  });

  it('Should not show cancel button for past or cancelled sessions', () => {
    cy.intercept('GET', '/api/v1/therapy-session', [
      {
        id: 'past-session',
        action: 'COMPLETED_BOOKING',
        clientTimezone: 'Europe/London',
        serviceName: 'Individual Therapy Session',
        serviceProviderName: 'Past Therapist',
        startDateTime: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        endDateTime: new Date(Date.now() - 82800000).toISOString(),
        cancelledAt: null,
        rescheduledFrom: null,
        completedAt: new Date(Date.now() - 43200000).toISOString(),
        partnerAccessId: 'past-access-id',
      },
      {
        id: 'cancelled-session',
        action: 'CANCELLED_BOOKING',
        clientTimezone: 'Europe/London',
        serviceName: 'Individual Therapy Session',
        serviceProviderName: 'Cancelled Therapist',
        startDateTime: new Date(Date.now() + 172800000).toISOString(), // In two days
        endDateTime: new Date(Date.now() + 176400000).toISOString(),
        cancelledAt: new Date(Date.now() + 86400000).toISOString(),
        rescheduledFrom: null,
        completedAt: null,
        partnerAccessId: 'cancelled-access-id',
      },
    ]).as('getTherapySessions');

    cy.reload();
    cy.wait('@getTherapySessions');

    cy.get('[data-testid="therapy-booking-item"]').contains('Past Session').should('exist').click();
    cy.get('[data-testid="therapy-booking-item"]')
      .find('button')
      .contains('Cancel')
      .should('not.exist');
    cy.get('[data-testid="therapy-booking-item"]')
      .contains('Cancelled Session')
      .should('exist')
      .click();
    cy.get('[data-testid="therapy-booking-item"]')
      .find('button')
      .contains('Cancel')
      .should('not.exist');
  });

  it('Should display an error message if cancelling a session fails', () => {
    cy.intercept('GET', '/api/v1/therapy-session', [
      {
        id: 'upcoming-session-with-error',
        action: 'NEW_BOOKING',
        clientTimezone: 'Europe/London',
        serviceName: 'Individual Therapy Session',
        serviceProviderName: 'Error Therapist',
        startDateTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        endDateTime: new Date(Date.now() + 90000000).toISOString(),
        cancelledAt: null,
        rescheduledFrom: null,
        completedAt: null,
        partnerAccessId: 'error-access-id',
      },
    ]).as('getTherapySessionsWithError');
    cy.reload();
    cy.wait('@getTherapySessionsWithError');

    cy.intercept('POST', '/api/v1/therapy-session/upcoming-session-with-error/cancel', {
      statusCode: 500,
      body: { message: 'Failed to cancel session' },
    }).as('cancelTherapySessionError');

    cy.get('[data-testid="therapy-booking-item"]').contains('Upcoming Session').click();
    cy.get('[data-testid="therapy-booking-item"]').find('button').contains('Cancel').click();
    cy.get('[role="dialog"]').should('be.visible').and('contain', 'Confirm Cancellation');
    cy.get('[role="dialog"]').find('button').contains('Cancel Session').click();

    cy.wait('@cancelTherapySessionError');
    cy.get('[data-testid="therapy-booking-item"]')
      .contains('Failed to cancel session')
      .should('be.visible');
  });
});
