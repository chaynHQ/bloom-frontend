describe('Auth redirect', () => {
  // `dating-boundaries-and-relationships` is partner-only (no 'Public'), so a logged-out visitor
  // gets the sign-up preview in place of the session. Public-course sessions are covered in
  // public/public-course-session.
  const gatedSession = '/courses/dating-boundaries-and-relationships/what-are-boundaries';

  before(() => {
    cy.cleanUpTestState();
  });

  it('offers a way in on a session a logged-out visitor cannot access, preserving the return path', () => {
    cy.visit(gatedSession, { failOnStatusCode: false });

    // The preview's log-in link carries the return path so the visitor lands back here after auth.
    cy.get('[qa-id="access-full-course-card"] a[qa-id="access-full-course-login-link"]', {
      timeout: 10000,
    })
      .should('have.attr', 'href')
      .and('include', `return_url=${encodeURIComponent(gatedSession)}`);

    cy.get('[qa-id="access-full-course-card"] a[qa-id="access-full-course-login-link"]').click();
    cy.get('h1').should('contain', 'Welcome back');
    cy.url().should('include', `return_url=${encodeURIComponent(gatedSession)}`);
  });
});
