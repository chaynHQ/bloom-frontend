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
      .click(); 

    // cy.getIframeBody().find('button').click(); Attempting to watch the session video. iframe isnt working at the moment

    cy.get('a[href*="what-is-sexual-trauma"]', {
      timeout: 8000,
    })
      .first()
      .click(); 

    cy.contains('How was this session?').should('not.exist'); 

    cy.get('h1').should('contain', 'What is sexual trauma?');

    cy.get('h3').contains('Activity').click(); 

    cy.get('h3').contains('Bonus content').click();

    cy.get('button').contains('Session complete').click();

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
