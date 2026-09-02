describe('Auth redirect', () => {
  // `dating-boundaries-and-relationships` is partner-only (no 'Public'), so a logged-out visitor
  // gets the login dialog. Public-course sessions are covered in public/public-course-session.
  const gatedSession =
    '/courses/dating-boundaries-and-relationships/what-are-boundaries';

  before(() => {
    cy.cleanUpTestState();
  });

  it('shows the login dialog on a session a logged-out visitor cannot access', () => {
    cy.visit(gatedSession, { failOnStatusCode: false });
    cy.get('[qa-id="dialogLoginButton"]').should('contain', 'Log in').click();
    cy.get('h1').should('contain', 'Welcome back');
    cy.url().should('include', `return_url=${encodeURIComponent(gatedSession)}`);
  });
});
