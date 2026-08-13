// Browsed signed out. Assertions use qa-ids and the app's own translation strings — the hero copy
// and the editor-composed sections come from Storyblok and are not asserted here.
const HOME_PAGE_URL = '/';

describe('Home page should display', () => {
  beforeEach(() => {
    cy.cleanUpTestState();
    cy.visit(HOME_PAGE_URL, { failOnStatusCode: false });
  });

  it('hero with a sign-up call to action', () => {
    cy.get('h1', { timeout: 10000 }).should('not.be.empty');
    cy.get('[qa-id=home-hero-join-button]')
      .should('be.visible')
      .and('contain', 'Join Bloom, always free')
      .and('have.attr', 'href', '/auth/register');
  });

  it('individual sessions section', () => {
    cy.get('[qa-id=home-sessions]', { timeout: 10000 }).within(() => {
      cy.get('h2').should('contain', 'Individual sessions');
      cy.get('[qa-id=library-card]').should('have.length.greaterThan', 0);
      cy.get('[qa-id=home-sessions-browse-all]')
        .should('contain', 'Browse all sessions')
        .and('have.attr', 'href', '/library?type=session');
    });
  });

  it('courses section', () => {
    cy.get('[qa-id=home-courses]', { timeout: 10000 }).within(() => {
      cy.get('h2').should('contain', 'Courses');
      cy.get('[qa-id=library-card]').should('have.length.greaterThan', 0);
      cy.get('[qa-id=home-courses-browse-all]')
        .should('contain', 'Browse all courses')
        .and('have.attr', 'href', '/library?type=course');
    });
  });

  it('no continue learning section for a signed out visitor', () => {
    cy.get('[qa-id=home-sessions]', { timeout: 10000 }).should('exist');
    cy.get('[qa-id=home-continue-learning]').should('not.exist');
  });

  it('get support section', () => {
    cy.get('[qa-id=support-section]', { timeout: 10000 }).within(() => {
      cy.get('h2').should('contain', 'Get support');
      cy.get('[qa-id=support-card-messaging]')
        .should('contain', '1-to-1 messaging')
        .and('have.attr', 'href', '/messaging');
      cy.get('[qa-id=support-card-notes]')
        .should('contain', 'Notes from Bloom')
        .and('have.attr', 'href', '/subscription/whatsapp');
    });
  });

  it('sign up section', () => {
    cy.get('[qa-id=sign-up-section]', { timeout: 10000 }).within(() => {
      cy.get('h2').should('contain', 'Built with you in mind');
      cy.get('[qa-id=sign-up-section-multilingual]').should('exist');
      cy.get('[qa-id=sign-up-section-freeAndAnonymous]').should('exist');
      cy.get('[qa-id=sign-up-section-exploreAtYourPace]').should('exist');
      cy.get('[qa-id=sign-up-section-cta]').should('have.attr', 'href', '/auth/register');
    });
  });
});
