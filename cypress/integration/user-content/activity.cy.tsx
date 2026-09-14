describe('Activity resource pages', () => {
  it('redirects the retired /activities hub to the library, filtered to activities', () => {
    cy.visit('/activities');

    cy.location('pathname').should('eq', '/library');
    cy.location('search').should('include', 'format=activity');
  });

  it('renders an activity and shows the login gate to a logged-out visitor', () => {
    cy.visit('/activity/thought-diaries');

    cy.contains('h1', 'Thought diaries', { timeout: 10000 }).should('be.visible');

    // login_required defaults to true, so a logged-out visitor gets the preview (title,
    // description, sign-up card) in place of the resource body — no modal, page stays reachable.
    cy.get('[qa-id=access-full-course-card]', { timeout: 10000 }).should('be.visible');
    cy.get('[qa-id=dialogLoginButton]').should('not.exist');
  });
});
