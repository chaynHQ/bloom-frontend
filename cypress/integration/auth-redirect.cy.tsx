describe('Auth redirect', () => {
  before(() => {
    cy.cleanUpTestState();
  });
  it('User visits a page with an auth guard and should be redirected', () => {
    cy.visit('/courses');
    cy.wait(2000);
    cy.get('h2', { timeout: 5000 }).should('contain', 'Welcome back');
    cy.url().should('include', 'return_url=%2Fcourses');
  });
});
