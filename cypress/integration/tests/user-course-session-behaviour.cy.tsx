describe.only('A logged in user should be able to navigate to a course session and complete it', () => {
  const newUserEmail = `cypresstestemail+${Date.now()}@chayn.co`;
  const password = 'testpassword';

  before(() => {
    cy.cleanUpTestState();

    cy.createUser({
      //create test user
      emailInput: newUserEmail,
      passwordInput: password,
    });
    cy.logInWithEmailAndPassword(newUserEmail, password); //log in to test user
  });

  it('Should go to courses page and select a course & session', () => {
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
  });

  it('Should read activity & bonus content, complete session and complete feedback form', () => {
    cy.visit('/courses/healing-from-sexual-trauma/what-is-sexual-trauma');

    cy.contains('How was this session?').should('not.exist'); ///no feedback form shown before course has been started

    cy.get('h3', { timeout: 10000 }).contains('Activity').click(); //open activities

    cy.get('h3').contains('Bonus content').click(); //open bonus content

    cy.get('button').contains('Session complete').click(); //mark course as complete

    cy.get('h2').contains('How was this session?').should('exist'); //feedback form available after course has started

    cy.get('button').contains('Send').click(); //try to send feedback without selecting feedback option first

    cy.get('p').contains('Please select a rating before sending.').should('exist'); //give warning to user

    cy.get('input[name="feedback-radio-buttons"').first().check(); //click feedback option

    cy.get('button').contains('Send').click(); //submit feedback

    cy.get('h3').contains('Thank you for submitting your feedback').should('exist'); //check user feedback
  });

  after(() => {
    cy.logout();
  });
});
