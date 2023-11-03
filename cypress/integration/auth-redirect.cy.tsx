describe('Auth redirect', () => {
  before(() => {
    cy.cleanUpTestState();
  });
  it('User visits the courses page and should be redirected with correct url', () => {
    cy.visit('/courses');
    cy.wait(2000);
    cy.get('h2', { timeout: 8000 }).should('contain', 'Welcome back');
    cy.url().should('include', 'return_url=%2Fcourses');
  });
  it('User visits a session page with an auth guard and should be redirected', () => {
    cy.visit(
      '/courses/image-based-abuse-and-rebuilding-ourselves/the-social-context-of-image-based-abuse-and-victim-blaming',
    );
    cy.wait(2000);
    cy.get('h2', { timeout: 8000 }).should('contain', 'Welcome back');
    cy.url().should(
      'include',
      'return_url=%2Fcourses%2Fimage-based-abuse-and-rebuilding-ourselves%2Fthe-social-context-of-image-based-abuse-and-victim-blaming',
    );
  });
});
