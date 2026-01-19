describe('Shorts Flow', () => {
  const email = `cypresstestemail+${Date.now()}@chayn.co`;
  const password = 'testtesttest';

  before(() => {
    cy.cleanUpTestState();
    cy.createUser({ emailInput: email, passwordInput: password });
  });

  it('Should allow a user to play a short, select a related session, log in, and continue to the session', () => {
    // User visits the home page
    cy.visit('/');

    // User clicks on a short titled "Sex after trauma"
    cy.contains('Sex after trauma', { timeout: 10000 }).should('be.visible').click();

    // User plays the short video by clicking the react-player preview
    cy.get('.react-player__preview', { timeout: 10000 }).should('be.visible').click();
    cy.wait(2000); // wait to ensure user plays the short

    // User clicks on a related session titled "Sexuality and desire"
    cy.contains('h3', 'Sexuality and desire', { timeout: 10000 }).should('be.visible').click();

    // User is prompted to login
    cy.get('a[qa-id="dialogLoginButton"]').click();

    // User logs in
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('button[type=submit]').click();
    cy.wait(2000); // wait to ensure user is redirected to and plays the session

    // User is redirected to and plays the session by clicking the react-player preview
    cy.get('.react-player__preview', { timeout: 10000 }).should('be.visible').click();
    cy.wait(2000); // wait to ensure user is redirected to and plays the session

    // User clicks the button to complete session
    cy.contains('button', 'Session complete', { timeout: 10000 }).should('be.visible').click();

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
