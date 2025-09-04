describe('Videos Flow', () => {
  const email = `cypresstestemail+${Date.now()}@chayn.co`;
  const password = 'testtesttest';

  before(() => {
    cy.cleanUpTestState();
    cy.createUser({ emailInput: email, passwordInput: password });
  });

  it('Should allow a user to navigate to Courses, select a video, log in and play video', () => {
    // User visits the home page
    cy.visit('/');

    // User clicks on Courses
    cy.get(`[qa-id=secondary-nav-courses-button]`, { timeout: 10000 }).should('exist').click();

    // User clicks on a conversation
    cy.contains('What is somatics?', {
      timeout: 10000,
    })
      .should('exist')
      .click();

    // User is prompted to login
    cy.get('a[qa-id="dialogLoginButton"]').click();

    // User logs in
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('button[type=submit]').click();
    cy.wait(2000); // wait to ensure user is redirected to the video

    // User plays the short video
    cy.get('.react-player__preview', { timeout: 10000 }).should('be.visible').click();
    cy.wait(2000); // wait to ensure user plays the video

    cy.get('[data-testid="progress-status"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="team-member-card"]').should('exist');

    // Feedback form appears
    cy.contains('h2', 'How was this session?').should('be.visible');

    // Click the Send button and check for error message
    cy.get('button').contains('Send').click();
    cy.contains('p', 'Please select a rating before sending.').should('be.visible');

    // User selects a rating
    cy.get('input[name="feedback-radio-buttons"]').first().check();

    // User submits feedback
    cy.contains('button', 'Send').click();
    cy.wait(2000);

    // Confirmation message appears
    cy.contains('h3', 'Thank you for submitting your feedback').should('exist');
  });

  after(() => {
    cy.logout();
  });
});
