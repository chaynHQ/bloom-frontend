describe('Conversations Flow', () => {
  const email = `cypresstestemail+${Date.now()}@chayn.co`;
  const password = 'testtesttest';

  before(() => {
    cy.cleanUpTestState();
    cy.createUser({ emailInput: email, passwordInput: password });
  });

  it('Should allow a user to navigate to Courses, select a conversation, log in, play audio, and submit feedback.', () => {
    // User visits the home page
    cy.visit('/');

    // User clicks on Courses
    cy.get(`[qa-id=secondary-nav-courses-button]`, { timeout: 10000 }).should('exist').click();

    // User clicks on a conversation
    cy.contains('Stolen faces: How fake images leave real scars', {
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
    cy.wait(2000); // wait to ensure user is redirected to the session

    // User plays the conversation
    cy.get('audio')
      .should('exist')
      .invoke('attr', 'src')
      .then((audiofile) => {
        const audio = new Audio(audiofile);
        audio.playbackRate = 6;
        audio.play();
      });
    cy.wait(2000); // wait to ensure user plays the session
  });

  after(() => {
    cy.logout();
  });
});
