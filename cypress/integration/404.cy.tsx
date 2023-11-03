// Custom 404 page doesn't work on the dev server
// Skipping for now until we have solved the issue
describe.skip('Custom 404 page should display if wrong url is typed in', () => {
  before(() => {
    cy.cleanUpTestState();
  });

  it('Should show custom 404 page', () => {
    cy.visit('/invalid-url', { failOnStatusCode: false });
    cy.get('p', { timeout: 10000 }).contains('This page could not be found');
  });

  it('Should show custom 404 page at incorrect courses ', () => {
    cy.visit('/courses/invalid-course', { failOnStatusCode: false });
    cy.get('p', { timeout: 10000 }).contains('This page could not be found');
  });
});
