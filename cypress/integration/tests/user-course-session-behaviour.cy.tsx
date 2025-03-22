describe.only('A course session user', () => {
  const email = `cypresstestemail+${Date.now()}@chayn.co`;
  const password = 'testtesttest';

  before(() => {
    cy.cleanUpTestState();
    cy.createUser({ emailInput: email, passwordInput: password });
    cy.logInWithEmailAndPassword(email, password);
  });

  it('Should navigate to a session and complete it', () => {
    cy.get(`[qa-id=secondary-nav-courses-button]`, { timeout: 8000 }).should('exist').click(); //navigate to courses

    cy.get('a[href*="healing-from-sexual-trauma"]', {
      timeout: 8000,
    })
      .first()
      .click(); //click on a course when link load

    // cy.getIframeBody().find('button').click(); Attempting to watch the session video. iframe isnt working at the moment

    cy.get('a[href*="what-is-sexual-trauma"]', {
      timeout: 8000,
    })
      .first()
      .click(); //click on a session when link loads

    cy.contains('How was this session?').should('not.exist'); ///no feedback form shown before course has been started

    cy.get('h1').should('contain', 'What is sexual trauma?');

    cy.get('h3').contains('Activity').click(); //open activities

    cy.get('h3').contains('Bonus content').click(); //open bonus content

    // Wait for button to be enabled before clicking
    cy.get('button').contains('Session complete').should('not.be.disabled').click(); //mark course as complete

    // Wait for loading state to finish and feedback form to appear
    cy.get('button').contains('Session complete').should('not.be.disabled');
    cy.get('h2', { timeout: 15000 }).contains('How was this session?').should('exist'); //feedback form available after course has started

    cy.get('button').contains('Send').click(); //try to send feedback without selecting feedback option first

    cy.get('p').contains('Please select a rating before sending.').should('exist'); //give warning to user

    cy.get('input[name="feedback-radio-buttons"').first().check(); //click feedback option

    cy.get('button').contains('Send').click(); //submit feedback

    cy.get('h3', { timeout: 15000 })
      .contains('Thank you for submitting your feedback')
      .should('exist'); //check user feedback
  });

  after(() => {
    cy.logout();
  });
});
