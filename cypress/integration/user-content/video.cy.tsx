describe('Video Flow', () => {
  const email = Cypress.uniqueEmail();
  const password = 'testtesttest';

  before(() => {
    cy.cleanUpTestState();
    cy.createUser({ emailInput: email, passwordInput: password });
  });

  it('plays a public short without an account', () => {
    cy.visit('/');

    cy.get(`[qa-id=secondary-nav-library-button]`, { timeout: 10000 }).should('exist').click();

    // The library only renders its first page of results, so search for the short.
    cy.get('[qa-id=library-search-input]', { timeout: 10000 }).type('Sex after trauma');
    cy.get('a[aria-label="Sex after trauma"]', { timeout: 10000 }).click();

    // A short is public, so the video plays straight away — no sign-up preview.
    cy.get('[qa-id="access-full-course-card"]').should('not.exist');
    cy.get('.react-player__preview', { timeout: 10000 }).should('be.visible').click();
    cy.wait(2000);
  });

  it('gates a somatic video behind sign-up, then plays it after logging in', () => {
    cy.visit('/');

    cy.get(`[qa-id=secondary-nav-library-button]`, { timeout: 10000 }).should('exist').click();

    cy.get('[qa-id=library-search-input]', { timeout: 10000 }).type('What is somatics');
    cy.get('a[aria-label="What is somatics?"]', { timeout: 10000 }).click();

    // Logged out, the video is replaced by the sign-up preview; follow its log-in link.
    cy.get('a[qa-id="access-full-course-login-link"]', { timeout: 10000 }).click();

    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('button[type=submit]').click();
    cy.wait(2000); // wait to ensure user is redirected to the video

    cy.get('.react-player__preview', { timeout: 10000 }).should('be.visible').click();
    cy.wait(8000); // wait to ensure user plays the video

    cy.get('[data-testid="team-member-card"]').should('exist');
  });

  after(() => {
    cy.logout();
  });
});
