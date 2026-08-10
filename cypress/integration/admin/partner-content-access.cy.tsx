describe('users signing up through partner channels can properly access partner-specific course content', () => {
  const password = 'testtesttest';

  const bumbleSpecificCourseName = /Dating, boundaries, and Relationships/i;

  beforeEach(() => {
    cy.cleanUpTestState();
  });

  it('Bumble-specific courses and resources exclusively exist on the /courses page for Bumble users.', () => {
    const username_partner = Cypress.uniqueEmail('cypresstestemailpartner');

    //log in as a Bumble user and see if the course appears
    cy.visit('/welcome/bumble');
    cy.get('a', { timeout: 8000 }).contains('Get started').click();
    cy.wait(2000); // waiting for dom to rerender
    cy.get('h2', { timeout: 8000 }).should('contain', 'Create account');
    cy.get('#name').type('Cypress test');
    cy.get('#email').type(username_partner);
    cy.get('#password').type('testpassword');
    cy.get('button[type="submit"]').contains('Create account').click();
    cy.waitForAuthenticatedApp();

    cy.visit('/courses');

    cy.waitForAuthenticatedApp();
    cy.get('h3').contains(bumbleSpecificCourseName).should('exist');
  });

  it('Non-parter users should not see Partner-specific courses and resources', () => {
    const username_regular = Cypress.uniqueEmail('cypresstestemailRegular');

    cy.createUser({ emailInput: username_regular, passwordInput: password });
    cy.logInWithEmailAndPassword(username_regular, password);
    cy.visit('/courses');
    // Without this the negative assertion below can pass for the wrong reason — an
    // unloaded user has no partner content either.
    cy.waitForAuthenticatedApp();
    cy.get('h3').contains(bumbleSpecificCourseName).should('not.exist');
  });

  afterEach(() => {
    cy.logout();
  });
});
