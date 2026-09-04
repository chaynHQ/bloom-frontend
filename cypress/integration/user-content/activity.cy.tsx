describe('Activity resource pages', () => {
  it('redirects the retired /activities hub to the library, filtered to activities', () => {
    cy.visit('/activities');

    cy.location('pathname').should('eq', '/library');
    cy.location('search').should('include', 'format=activity');
  });

  it('redirects an old ?openacc= deep link to the new per-activity page', () => {
    cy.visit('/activities?openacc=activities-thought-diaries');

    cy.location('pathname').should('eq', '/activity/activities-thought-diaries');
  });

  it('renders an activity and shows the login gate to a logged-out visitor', () => {
    cy.visit('/activity/activities-thought-diaries');

    cy.contains('h2', 'Thought diaries', { timeout: 10000 }).should('be.visible');

    // login_required defaults to true, so a logged-out visitor sees the login dialog
    // over the preview rather than the full resource.
    cy.get('[qa-id=dialogLoginButton]', { timeout: 10000 }).should('be.visible');
  });
});
