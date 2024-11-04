describe('Initial exploration', () => {
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
    cy.get(`[qa-id=secondary-nav-courses-button]`).click();
    cy.get('a', { timeout: 8000 }).contains('Get started');
    cy.get(`h3`).contains('Reclaiming resilience');
    cy.get(`h3`).should('not.contain', 'Dating, boundaries, and relationships');
    cy.get(`h3`).contains('Healing from sexual trauma').click();
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
    cy.get(`[qa-id=secondary-nav-courses-button]`).click();
    cy.get('a', { timeout: 8000 }).contains('Get started');
    cy.get(`h3`).contains('Healing from sexual trauma');
    cy.get(`h3`).should('not.contain', 'Reclaiming resilience');
    cy.get(`h3`).should('contain', 'Dating, boundaries, and relationships');
    cy.get(`h3`).contains('Dating, boundaries, and relationships').click();
    cy.get('h3').contains('What are boundaries').click();
    cy.get('#signup-banner').should('be.visible');
  });
  after(() => {
    cy.cleanUpTestState();
  });
});
