// Visual review helper (not an assertion suite): captures the library page across desktop and
// mobile so spacing details — sidebar rhythm, section borders, card gaps — can be eyeballed,
// and confirms individual course sessions are searchable alongside courses/resources.

const DESKTOP = [1440, 900];
const MOBILE = [390, 844];

// Wait for the client-rendered library results to actually populate. The "Get support" band has
// two link cards that exist immediately, so gate on the results-count header reading non-zero
// and on there being more anchor cards than just those two support links.
const waitForLibrary = () => {
  cy.contains('Explore the library', { timeout: 30000 }).should('be.visible');
  cy.contains(/\d+ results?/, { timeout: 30000 })
    .should('be.visible')
    .should('not.contain', '0 results');
  cy.get('a[aria-label]').should('have.length.greaterThan', 4);
};

// The fixed cookie banner overlaps the right column; dismiss it so shots are clean.
const dismissCookies = () => {
  cy.get('body').then(($b) => {
    if ($b.text().includes('Reject Cookies')) {
      cy.contains('button', 'Reject Cookies').click({ force: true });
    }
  });
};

describe('Library — visual review', () => {
  it('desktop', () => {
    cy.viewport(DESKTOP[0], DESKTOP[1]);
    cy.visit('/library');
    dismissCookies();
    waitForLibrary();
    cy.screenshot('library-desktop-full', { capture: 'fullPage' });
  });

  it('mobile', () => {
    cy.viewport(MOBILE[0], MOBILE[1]);
    cy.visit('/library');
    dismissCookies();
    waitForLibrary();
    cy.screenshot('library-mobile-full', { capture: 'fullPage' });
    // Open the mobile filter drawer to review the filter-group spacing.
    cy.contains('button', 'Filter').click();
    cy.contains('Content type').should('be.visible');
    cy.screenshot('library-mobile-filters-open', { capture: 'fullPage' });
  });

  it('course sessions are searchable', () => {
    cy.viewport(DESKTOP[0], DESKTOP[1]);
    cy.visit('/library');
    dismissCookies();
    waitForLibrary();
    // A real course *lesson* title (a Session block nested inside a course), not a standalone
    // resource — proves individual course sessions now appear in library search results.
    cy.get('[qa-id=library-search-input]').type('Introduction and what you should know');
    cy.contains('a[aria-label]', 'Introduction and what you should know', {
      timeout: 15000,
    }).should('be.visible');
    cy.screenshot('library-course-session-search', { capture: 'fullPage' });
  });
});
