describe('Initial exploration', () => {
  it('should be able to explore all pages', () => {
    cy.visit('/');
    cy.get('p', { timeout: 8000 }).contains(
      'Learn and heal from trauma in a private, supportive space.',
    );
    cy.get(`[qa-id=secondary-nav-chat-button]`).click();
    cy.get('a', { timeout: 8000 }).contains('Get started');
    cy.get(`[qa-id=secondary-nav-grounding-button]`).click();
    cy.get('a', { timeout: 8000 }).contains('Get started');
    cy.get(`[qa-id=secondary-nav-activities-button]`).click();
    cy.get('a', { timeout: 8000 }).contains('Get started');
    cy.get(`[qa-id=secondary-nav-notes-button]`).click();
    cy.get('a', { timeout: 8000 }).contains('Get started');
    cy.get(`[qa-id=secondary-nav-courses-button]`).click();
    cy.get('a', { timeout: 8000 }).contains('Get started');
  });
});
