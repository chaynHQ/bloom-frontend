describe('Initial exploration', () => {
  it('should be able to explore all pages', () => {
    cy.visit('/');
    cy.get('h1').contains('Join us on your healing journey');
    cy.get(`[qa-id=secondary-nav-chat-button]`).click();
    cy.get('a').contains('Get started');
    cy.get(`[qa-id=secondary-nav-grounding-button]`).click();
    cy.get('a').contains('Get started');
    cy.get(`[qa-id=secondary-nav-activities-button]`).click();
    cy.get('a').contains('Get started');
    cy.get(`[qa-id=secondary-nav-notes-button]`).click();
    cy.get('a').contains('Get started');
    cy.get(`[qa-id=secondary-nav-courses-button]`).click();
    cy.get('a').contains('Get started');
  });
});
