describe('Home page', () => {
  it('should render', () => {
    cy.visit('/');
    cy.get('p', { timeout: 5000 }).contains(
      'Learn and heal from trauma in a private, supportive space.',
    );
    cy.get(`[qa-id=team-link]`).should('exist'); //test branch code
  });
});
