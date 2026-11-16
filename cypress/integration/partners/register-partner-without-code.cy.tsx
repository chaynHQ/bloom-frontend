// Note Bumble has automatic access code feature
describe('Register without access code', () => {
  before(() => {
    cy.cleanUpTestState();
  });

  it('Access code input should not be on form and correct courses should be available', () => {
    const username = Cypress.uniqueEmail();

    // Start from the home page
    cy.visit('/welcome/bumble');
    cy.get('a', { timeout: 8000 }).contains('Get started').click();
    cy.wait(2000); // waiting for dom to rerender
    cy.get('h1', { timeout: 8000 }).should('contain', 'Create account');
    cy.get('#name').type('Cypress test');
    cy.get('#email').type(username);
    cy.get('#password').type('testpassword');
    cy.get('button[type="submit"]').contains('Create account').click();
    cy.waitForAuthenticatedApp();
    cy.get('h2', { timeout: 8000 }).should('contain', 'Help us understand');
    cy.get('a').contains('Go to library').click();
    cy.wait(2000); // Waiting for dom to rerender
    // Skip lands on the library, where each result is an anchor card.
    cy.get('a[aria-label="Dating, boundaries, and relationships"]', { timeout: 8000 }).click();
    cy.get('h3').contains('What are boundaries').click();
  });

  it('Partner in UTM link attaches partner and shows partner register form', () => {
    cy.cleanUpTestState();
    const utmUsername = Cypress.uniqueEmail();

    // Entry via a partner UTM link (e.g. a Bumble campaign) should attribute the
    // referral, so registering shows the Bumble form (no access code) and attaches the partner.
    cy.visit('/auth/register?utm_source=bumble');
    cy.wait(2000); // waiting for referral detection + dom to rerender
    cy.get('h1', { timeout: 8000 }).should('contain', 'Create account');
    cy.get('#partnerAccessCode').should('not.exist');
    cy.get('#name').type('Cypress test');
    cy.get('#email').type(utmUsername);
    cy.get('#password').type('testpassword');
    cy.get('button[type="submit"]').contains('Create account').click();
    cy.waitForAuthenticatedApp();
    cy.get('h2', { timeout: 8000 }).should('contain', 'Help us understand');
    cy.get('a').contains('Go to library').click();
    cy.wait(2000); // Waiting for dom to rerender
    // Bumble partner content is available, confirming the partner was attached at signup
    cy.get('a[aria-label="Dating, boundaries, and relationships"]', { timeout: 8000 }).click();
    cy.get('h3').contains('What are boundaries').click();
  });

  // Test Partner has the automatic access code feature and a slug that differs from its name.
  it('Register page for test-partner shows the form without a code field', () => {
    cy.cleanUpTestState();
    cy.visit('/auth/register?partner=test-partner');
    cy.get('h1', { timeout: 8000 }).should('contain', 'Create account');
    cy.get('#name').should('exist');
    cy.get('#partnerAccessCode').should('not.exist');
  });

  it('Registering through /welcome/test-partner creates a Test Partner access', () => {
    cy.cleanUpTestState();
    const testPartnerUsername = Cypress.uniqueEmail();

    cy.visit('/welcome/test-partner');
    cy.get('a[href="/auth/register?partner=test-partner"]', { timeout: 8000 })
      .contains('Get started')
      .click();
    cy.wait(2000); // waiting for dom to rerender
    cy.get('h1', { timeout: 8000 }).should('contain', 'Create account');
    cy.get('#partnerAccessCode').should('not.exist');
    cy.get('#name').type('Cypress test');
    cy.get('#email').type(testPartnerUsername);
    cy.get('#password').type('testpassword');
    cy.get('button[type="submit"]').contains('Create account').click();
    cy.waitForAuthenticatedApp();
    cy.get('h2', { timeout: 8000 }).should('contain', 'Help us understand');
    // The footer brands a member by their partner accesses, so with the referral cookie gone
    // this shows the access exists.
    cy.clearCookie('referralPartner');
    cy.visit('/account/settings');
    cy.waitForAuthenticatedApp();
    cy.get('footer img[alt="Test Partner logo"]', { timeout: 8000 }).should('exist');
    cy.get('footer img[alt="Test Partner Plus logo"]').should('not.exist');
  });

  after(() => {
    cy.logout();
  });
});
