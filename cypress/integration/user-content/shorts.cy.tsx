describe('Shorts Flow', () => {
  const email = Cypress.uniqueEmail();
  const password = 'testtesttest';

  before(() => {
    cy.cleanUpTestState();
    cy.createUser({ emailInput: email, passwordInput: password });
  });

  it('Should allow a user to play a short, follow its related session prompt, log in, and continue to the session', () => {
    // User visits the home page
    cy.visit('/');

    // User clicks on Library
    cy.get(`[qa-id=secondary-nav-library-button]`, { timeout: 10000 }).should('exist').click();

    // The library only renders its first page of results, so search for the short.
    cy.get('[qa-id=library-search-input]', { timeout: 10000 }).type('Sex after trauma');

    // User clicks on a short titled "Sex after trauma"
    cy.get('a[aria-label="Sex after trauma"]', { timeout: 10000 }).click();

    // User plays the short video by clicking the react-player preview
    cy.get('.react-player__preview', { timeout: 10000 }).should('be.visible').click();
    cy.wait(2000); // wait to ensure user plays the short

    // Signed out, the short shows the "access the full session" sign-up card in place of a direct
    // link; its "log in" link returns to the session after authenticating. The card only renders
    // once Firebase has resolved the visitor as logged out, which can lag well past the default
    // timeout on a fresh deployment.
    cy.get('[qa-id="access-full-course-card"]', { timeout: 30000 })
      .find('a[qa-id="access-full-course-login-link"]')
      .click();

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
