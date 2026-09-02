describe('A course session user', () => {
  const email = Cypress.uniqueEmail();
  const password = 'testtesttest';

  before(() => {
    cy.cleanUpTestState();
    cy.createUser({ emailInput: email, passwordInput: password });
    cy.logInWithEmailAndPassword(email, password);
  });

  it('Should navigate to a session and complete it', () => {
    // Test isolation resets the page to about:blank before this test runs, so the state
    // from before() (visiting '/' and logging in) doesn't carry over without revisiting.
    cy.visit('/');

    cy.get(`[qa-id=secondary-nav-library-button]`, { timeout: 8000 }).should('exist').click(); //navigate to the library

    cy.get('a[href*="healing-from-sexual-trauma"]', {
      timeout: 8000,
    })
      .first()
      .click();

    // cy.getIframeBody().find('button').click(); Attempting to watch the session video. iframe isnt working at the moment

    cy.get('a[href*="what-is-sexual-trauma"]', {
      timeout: 8000,
    })
      .first()
      .click();

    cy.contains('How was this session?').should('not.exist');

    cy.get('h1').should('contain', 'What is sexual trauma?');

    // The playlist lists every session in the course and marks the one being viewed.
    cy.get('[qa-id=session-playlist]').first().should('contain', 'What is sexual trauma?');

    // Activity opens by default; bonus content starts collapsed and expands on click.
    cy.get('[qa-id=session-activity] button').should('have.attr', 'aria-expanded', 'true');

    cy.get('[qa-id=session-bonus]')
      .first()
      .within(() => {
        cy.get('button').should('have.attr', 'aria-expanded', 'false').click();
        cy.get('button').should('have.attr', 'aria-expanded', 'true');
      });

    cy.get('[qa-id=session-complete-button]').click();

    cy.wait(2000);

    cy.get('h2').contains('How was this session?').should('exist');

    cy.get('button').contains('Send').click();

    cy.get('p').contains('Please select a rating before sending.').should('exist');

    cy.get('input[name="feedback-radio-buttons"]').first().check();

    cy.get('button').contains('Send').click();

    cy.get('h3').contains('Thank you for submitting your feedback').should('exist');
  });

  after(() => {
    cy.logout();
  });
});
