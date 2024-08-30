describe('About our courses page should', () => {
  before(() => {
    cy.cleanUpTestState();
  });

  it(' redirect the visitor to courses page', () => {
    cy.visit('/about-our-courses');
    cy.checkPageUrl('courses');
  });
});
