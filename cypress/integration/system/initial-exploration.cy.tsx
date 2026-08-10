describe('Initial exploration', () => {
  before(() => {
    cy.cleanUpTestState();
  });
  it('should be able to explore all pages', () => {
    cy.visit('/');
    cy.get('h1', { timeout: 8000 }).contains('Join us on your healing journey');
    cy.get(`[qa-id=secondary-nav-messaging-button]`).click();
    cy.get('a', { timeout: 8000 }).contains('Get started');
    cy.get(`[qa-id=secondary-nav-grounding-button]`).click();
    cy.get('a', { timeout: 8000 }).contains('Get started');
    cy.get(`[qa-id=secondary-nav-activities-button]`).click();
    cy.get('a', { timeout: 8000 }).contains('Get started');
    cy.get(`[qa-id=secondary-nav-notes-button]`).click();
    cy.get('a', { timeout: 8000 }).contains('Get started');
    cy.get(`[qa-id=secondary-nav-library-button]`).click();
    cy.contains('Reclaiming resilience', { timeout: 8000 }).should('exist');
    cy.contains('Dating, boundaries, and relationships').should('not.exist');
    cy.contains('Healing from sexual trauma').click();
    cy.wait(2000); // leave time for the page to load as flakey
    cy.get('h3').contains('What is sexual trauma').click();
    cy.get('#signup-banner').should('be.visible');
  });
  it('a user with partner referral should be able to explore all pages for partners', () => {
    cy.visit('/welcome/bumble');
    cy.get('h1', { timeout: 8000 }).contains('Join us on your healing journey');
    cy.get(`[qa-id=secondary-nav-messaging-button]`).click();
    cy.get('a', { timeout: 8000 }).contains('Get started');
    cy.get(`[qa-id=secondary-nav-grounding-button]`).click();
    cy.get('a', { timeout: 8000 }).contains('Get started');
    cy.get(`[qa-id=secondary-nav-activities-button]`).click();
    cy.get('a', { timeout: 8000 }).contains('Get started');
    cy.get(`[qa-id=secondary-nav-notes-button]`).click();
    cy.get('a', { timeout: 8000 }).contains('Get started');
    cy.get(`[qa-id=secondary-nav-library-button]`).click();
    cy.contains('Healing from sexual trauma', { timeout: 8000 }).should('exist');
    cy.contains('Reclaiming resilience').should('not.exist');
    cy.contains('Dating, boundaries, and relationships').should('exist');
    cy.contains('Dating, boundaries, and relationships').click();
    cy.get('h3').contains('What are boundaries').click();
    cy.get('#signup-banner').should('be.visible');
  });
  after(() => {
    cy.cleanUpTestState();
  });
});
