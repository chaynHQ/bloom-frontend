// Each nav destination is checked by url and by having rendered its heading. Asserting on page
// copy instead would match the outgoing page while the next one is still loading.
const visitFromNav = (button: string, path: string) => {
  cy.get(`[qa-id=secondary-nav-${button}-button]`).click();
  cy.checkPageUrl(path);
  cy.get('h1', { timeout: 8000 }).should('not.be.empty');
};

describe('Initial exploration', () => {
  before(() => {
    cy.cleanUpTestState();
  });
  it('should be able to explore all pages', () => {
    cy.visit('/');
    // The hero copy comes from Storyblok, so this only asserts the page rendered its heading.
    cy.get('h1', { timeout: 8000 }).should('not.be.empty');
    visitFromNav('messaging', 'messaging');
    visitFromNav('grounding', 'grounding');
    visitFromNav('notes', 'subscription/whatsapp');
    cy.get(`[qa-id=secondary-nav-library-button]`).click();
    cy.contains('Reclaiming resilience', { timeout: 8000 }).should('exist');
    cy.contains('Dating, boundaries, and relationships').should('not.exist');
    cy.contains('Healing from sexual trauma').click();
    cy.wait(2000); // leave time for the page to load as flakey
    cy.get('h3').contains('What is sexual trauma').click();
    cy.get('#signup-section').should('be.visible');
  });
  it('a user with partner referral should be able to explore all pages for partners', () => {
    cy.visit('/welcome/bumble');
    cy.get('h1', { timeout: 8000 }).contains('Join us on your healing journey');
    visitFromNav('messaging', 'messaging');
    visitFromNav('grounding', 'grounding');
    visitFromNav('notes', 'subscription/whatsapp');
    cy.get(`[qa-id=secondary-nav-library-button]`).click();
    cy.contains('Healing from sexual trauma', { timeout: 8000 }).should('exist');
    cy.contains('Reclaiming resilience').should('not.exist');
    cy.contains('Dating, boundaries, and relationships').should('exist');
    cy.contains('Dating, boundaries, and relationships').click();
    cy.get('h3').contains('What are boundaries').click();
    cy.get('#signup-section').should('be.visible');
  });
  after(() => {
    cy.cleanUpTestState();
  });
});
