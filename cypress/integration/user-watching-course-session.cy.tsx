describe('A logged in user should be able to watch a course session and complete it', () => {
  const newUserEmail = `cypresstestemail+${Date.now()}@chayn.co`;
  const password = 'testpassword';

  before(() => {
    cy.cleanUpTestState();

    cy.createUser({
      //create test user
      emailInput: newUserEmail,
      passwordInput: password,
    });
  });

  it('Should go to the courses page and select a course', () => {
    cy.logInWithEmailAndPassword(newUserEmail, password); //log in to test user

    cy.get(`[qa-id=secondary-nav-courses-button]`).should('exist').click(); //navigate to courses

    cy.get('a[href*="healing-from-sexual-trauma"]', {
      timeout: 4000,
    })
      .first()
      .click(); //click on a course when link load

    // cy.getIframeBody().find('button').click(); iframe isnt working at the moment

    cy.get('a[href*="what-is-sexual-trauma"]', {
      timeout: 4000,
    })
      .first()
      .click(); //click on a session when link loads

    cy.get('h3').contains('Activity').click(); //open activities

    cy.get('h3').contains('Bonus content').click(); //open bonus content

    cy.get('button').contains('Session complete').click(); //mark course as complete

    cy.deleteUserByEmail(newUserEmail); //delete test user
  });

  after(() => {
    cy.logout();
  });
});
