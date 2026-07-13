// The library is the unified content hub: courses, individual course sessions, and standalone
// single sessions (audio conversations, somatic videos, shorts) behind one guided search.
//
// Selectors lean on the semantic hooks the cards expose (`data-kind`, `data-format`,
// `data-progress`) rather than on badge wording, so these assertions test the filter model
// itself and survive copy changes.

const PAGE_SIZE = 8; // must match PAGE_SIZE in components/pages/LibraryPage.tsx

const cards = () => cy.get('[data-testid=library-card]');

// Assert on the rendered count with a retrying `should`, so we wait for the filtered re-render
// rather than reading a stale number.
const expectCount = (assert: (count: number) => void) =>
  cy.get('[qa-id=library-results-count]').should(($el) => assert(parseInt($el.text(), 10)));

const readCount = () =>
  cy
    .get('[qa-id=library-results-count]')
    .invoke('text')
    .then((text) => parseInt(text, 10));

// The sidebar filter groups render twice (mobile drawer + desktop sidebar), so always reach for
// the visible copy. Returns the <label> row, whose checkbox carries the disabled state.
const filterRow = (label: string) => cy.get('label:visible').contains(label).closest('label');

const waitForLibrary = () => {
  cy.contains('Explore the library', { timeout: 30000 }).should('be.visible');
  cards().should('have.length.greaterThan', 0);
};

describe('Library page', () => {
  // The library is public, so these browse it anonymously — which Cypress's default test isolation
  // already guarantees by clearing cookies and storage between tests.
  describe('Entry points', () => {
    beforeEach(() => {
      cy.viewport(1440, 900);
    });

    it('redirects the retired courses hub to the library', () => {
      cy.visit('/courses');

      cy.location('pathname').should('eq', '/library');
      waitForLibrary();
    });

    it('pre-selects a theme from a ?theme= deep link', () => {
      cy.visit('/library?theme=setting-boundaries');
      waitForLibrary();

      cy.get('[qa-id=library-theme-setting-boundaries]').should(
        'have.attr',
        'aria-pressed',
        'true',
      );
      // Every visible card carries the selected theme in its eyebrow.
      cards().each(($card) => expect($card.text()).to.contain('Setting boundaries'));
    });

    it('opens on the Courses tab from a ?type=course deep link', () => {
      cy.visit('/library?type=course');
      waitForLibrary();

      cy.get('[qa-id=library-kind-course]').should('have.attr', 'aria-pressed', 'true');
      cards().each(($card) => expect($card.attr('data-kind')).to.equal('course'));
    });

    it('ignores an unknown ?theme= key rather than filtering everything away', () => {
      cy.visit('/library?theme=not-a-real-theme');
      waitForLibrary();

      cy.get('[qa-id=library-kind-all]').should('have.attr', 'aria-pressed', 'true');
      cards().should('have.length', PAGE_SIZE);
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      // Desktop width keeps the filter checkboxes on-screen rather than behind the mobile toggle.
      cy.viewport(1440, 900);
      cy.visit('/library');
      waitForLibrary();
    });

    it('pages the results at PAGE_SIZE and reveals more on demand', () => {
      readCount().then((total) => {
        expect(total).to.be.greaterThan(PAGE_SIZE);
        cards().should('have.length', PAGE_SIZE);

        cy.contains('button', 'Load more').click();
        cards().should('have.length', Math.min(total, PAGE_SIZE * 2));
      });
    });

    it('resets pagination to the first page when a filter changes', () => {
      // Otherwise "Load more", then a narrowing filter, would leave a page-2-sized grid showing
      // against a much shorter result set.
      cy.contains('button', 'Load more').click();
      cards().should('have.length', PAGE_SIZE * 2);

      cy.get('[qa-id=library-kind-course]').click();
      cards().should('have.length.at.most', PAGE_SIZE);
    });

    it('"Courses" narrows the results to courses only', () => {
      readCount().then((all) => {
        cy.get('[qa-id=library-kind-course]').click();

        expectCount((count) => {
          expect(count).to.be.greaterThan(0);
          expect(count).to.be.lessThan(all);
        });
        cards().each(($card) => expect($card.attr('data-kind')).to.equal('course'));
      });
    });

    it('"Single sessions" narrows the results to sessions only', () => {
      cy.get('[qa-id=library-kind-session]').click();

      expectCount((count) => expect(count).to.be.greaterThan(0));
      cards().each(($card) => expect($card.attr('data-kind')).to.equal('session'));
    });

    it('filters by content type, returning only sessions of that format', () => {
      filterRow('Audio').find('input[type=checkbox]').check();

      expectCount((count) => expect(count).to.be.greaterThan(0));
      cards().each(($card) => {
        expect($card.attr('data-format')).to.equal('audio');
        expect($card.attr('data-kind')).to.equal('session');
      });
    });

    it('disables and clears the session-only filters while "Courses" is selected', () => {
      // Format and length describe a single session; a course has neither, so offering them
      // alongside "Courses" could only ever build a combination that returns nothing.
      filterRow('Audio').find('input[type=checkbox]').check().should('be.checked');

      cy.get('[qa-id=library-kind-course]').click();
      filterRow('Audio').find('input[type=checkbox]').should('be.disabled').and('not.be.checked');
      filterRow('Under 10 min').find('input[type=checkbox]').should('be.disabled');

      // Returning to "All" re-enables them.
      cy.get('[qa-id=library-kind-all]').click();
      filterRow('Audio').find('input[type=checkbox]').should('not.be.disabled');
    });

    it('combines search with the kind filter, and the empty state clears everything', () => {
      readCount().then((all) => {
        cy.get('[qa-id=library-search-input]').type('somatics');
        expectCount((count) => expect(count).to.be.lessThan(all));
        cy.get('a[aria-label="What is somatics?"]').should('exist');

        // Somatics content is all single sessions, so the same search under "Courses" is empty.
        cy.get('[qa-id=library-kind-course]').click();
        cy.contains('No matches for those filters').should('be.visible');
        cards().should('have.length', 0);

        // The empty state's action resets every filter, including the kind toggle.
        cy.contains('button', 'Clear filters').click();
        cy.get('[qa-id=library-search-input]').should('have.value', '');
        cy.get('[qa-id=library-kind-all]').should('have.attr', 'aria-pressed', 'true');
        expectCount((count) => expect(count).to.equal(all));
      });
    });

    it('shows the empty state for a search that matches nothing', () => {
      cy.get('[qa-id=library-search-input]').type('zzzznotarealtopic');

      cy.contains('No matches for those filters').should('be.visible');
      cards().should('have.length', 0);
      cy.get('[qa-id=library-results-count]').should('contain', '0 results');
    });

    it('surfaces individual course sessions alongside courses and standalone resources', () => {
      // A lesson nested inside a course, not a standalone resource — its href is scoped under
      // the parent course, which is what distinguishes the two in the results.
      cy.get('[qa-id=library-search-input]').type('Introduction and what you should know');

      cards().should('have.length.greaterThan', 0);
      cards()
        .first()
        .should('have.attr', 'data-kind', 'session')
        .find('a[href*="/courses/"]')
        .should('exist');

      // Storyblok gives course lessons no duration, so where a standalone session reports its
      // length, a lesson names the course it belongs to instead of showing an empty meta row.
      cards().first().should('contain', 'Part of Recovering from toxic and abusive relationships');
    });
  });

  describe('Progress on cards', () => {
    const email = `cypresstestemail+${Date.now()}@chayn.co`;
    const password = 'testtesttest';

    before(() => {
      cy.cleanUpTestState();
      cy.createUser({ emailInput: email, passwordInput: password });
      cy.logInWithEmailAndPassword(email, password);
    });

    after(() => {
      cy.logout();
    });

    it('shows no progress badge before the user has started anything', () => {
      cy.viewport(1440, 900);
      cy.visit('/library');
      waitForLibrary();

      cy.get('[data-testid=library-card-progress]').should('not.exist');
    });

    it('marks a completed session as Completed and its parent course as Started', () => {
      cy.viewport(1440, 900);

      // Work through a real session so progress is written by the app rather than stubbed.
      cy.visit('/courses/healing-from-sexual-trauma');
      cy.get('a[href*="what-is-sexual-trauma"]', { timeout: 10000 }).first().click();
      cy.get('h1', { timeout: 10000 }).should('contain', 'What is sexual trauma?');
      cy.contains('button', 'Session complete').scrollIntoView().click();
      cy.contains('How was this session?', { timeout: 10000 }).should('exist');

      cy.visit('/library');
      waitForLibrary();

      // The completed session carries a Completed badge.
      cy.get('[qa-id=library-search-input]').type('What is sexual trauma');
      cy.get('[data-testid=library-card]', { timeout: 15000 })
        .filter(':contains("What is sexual trauma")')
        .find('[data-testid=library-card-progress]')
        .should('have.attr', 'data-progress', 'completed')
        .and('contain', 'Completed');

      // Its parent course has been started, but not finished.
      cy.get('[qa-id=library-search-input]').clear().type('Healing from sexual trauma');
      cy.get('[data-testid=library-card][data-kind=course]', { timeout: 15000 })
        .filter(':contains("Healing from sexual trauma")')
        .find('[data-testid=library-card-progress]')
        .should('have.attr', 'data-progress', 'started')
        .and('contain', 'Started');
    });
  });
});
