describe('users signing up through partner channels can properly access partner-specific course content', () => {
  let username_partner = `cypresstestemailpartner+${Date.now()}@chayn.co`;
  let username_regular = `cypresstestemailRegular+${Date.now()}@chayn.co`;
  const password = 'testtesttest';

  const bumbleSpecificCourseName = 'Dating, boundaries, and relationships';
  // A lesson *inside* that course. The library gates a lesson on its parent course as well as on
  // the lesson's own partner restriction.
  const bumbleSpecificLessonName = 'Culture, patriarchy, and boundaries';

  // The library renders only its first page of results, so a plain absence assertion would pass
  // for leaked content that sorted below the fold. Search first, then read the result count: 0
  // results is a claim about the whole library.
  const searchLibraryFor = (title: string) => {
    cy.visit('/library');
    cy.contains('Explore the library', { timeout: 30000 }).should('be.visible');
    cy.get('[qa-id=library-search-input]').clear().type(title);
  };

  const expectFound = (title: string) => {
    searchLibraryFor(title);
    cy.get('[data-testid=library-card]').should('have.length.greaterThan', 0);
    cy.contains('[data-testid=library-card]', title).should('exist');
  };

  const expectNotFound = (title: string) => {
    searchLibraryFor(title);
    cy.get('[qa-id=library-results-count]').should('contain', '0 results');
    cy.get('[data-testid=library-card]').should('not.exist');
  };

  beforeEach(() => {
    cy.cleanUpTestState();
  });

  it('Bumble-specific courses and their lessons are visible in the library for Bumble users.', () => {
    //log in as a Bumble user and see if the course appears
    cy.visit('/welcome/bumble');
    cy.get('a', { timeout: 8000 }).contains('Get started').click();
    cy.wait(2000); // waiting for dom to rerender
    cy.get('h2', { timeout: 8000 }).should('contain', 'Create account');
    cy.get('#name').type('Cypress test');
    cy.get('#email').type(username_partner);
    cy.get('#password').type('testpassword');
    cy.get('button[type="submit"]').contains('Create account').click();
    cy.wait(4000); // Waiting for dom to rerender

    expectFound(bumbleSpecificCourseName);
    expectFound(bumbleSpecificLessonName);
  });

  it('Non-partner users should not see partner-specific courses, or the lessons inside them', () => {
    cy.createUser({ emailInput: username_regular, passwordInput: password });
    cy.logInWithEmailAndPassword(username_regular, password);

    expectNotFound(bumbleSpecificCourseName);
    expectNotFound(bumbleSpecificLessonName);
  });

  afterEach(() => {
    cy.logout();
  });
});
