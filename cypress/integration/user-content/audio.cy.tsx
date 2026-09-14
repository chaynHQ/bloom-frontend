describe('Audio Flow', () => {
  const email = Cypress.uniqueEmail();
  const password = 'testtesttest';

  before(() => {
    cy.cleanUpTestState();
    cy.createUser({ emailInput: email, passwordInput: password });
  });

  it('Should allow a user to navigate to the library, select an audio resource, log in and play it', () => {
    // User visits the home page
    cy.visit('/');

    // User clicks on Library
    cy.get(`[qa-id=secondary-nav-library-button]`, { timeout: 10000 }).should('exist').click();

    // The library only renders its first page of results, so search for the audio resource.
    cy.get('[qa-id=library-search-input]', { timeout: 10000 }).type('Stolen faces');

    // User clicks on the audio resource
    cy.get('a[aria-label="Stolen faces: How fake images leave real scars"]', {
      timeout: 10000,
    }).click();

    // Logged out, the audio player is replaced by the sign-up preview; follow its log-in link.
    cy.get('a[qa-id="access-full-course-login-link"]', { timeout: 10000 }).click();

    // User logs in
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('button[type=submit]').click();
    cy.wait(2000); // wait to ensure user is redirected to the resource

    // User plays the audio
    cy.get('audio')
      .should('exist')
      .invoke('attr', 'src')
      .then((audiofile) => {
        const audio = new Audio(audiofile);
        audio.playbackRate = 6;
        audio.play();
      });
  });

  after(() => {
    cy.logout();
  });
});
