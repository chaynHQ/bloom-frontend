describe('Sitemap should have', () => {
  const SITEMAP_URL = '/sitemap.xml';
  const BLOOM_URL = 'https://bloom.chayn.co';
  before(() => {
    cy.cleanUpTestState();
  });

  it('bloom url', () => {
    cy.request(SITEMAP_URL).its('body').should('include', BLOOM_URL);
  });
  it('about our courses url', () => {
    cy.request(SITEMAP_URL)
      .its('body')
      .should('include', BLOOM_URL + '/about-our-courses');
  });
  it('meet the team url', () => {
    cy.request(SITEMAP_URL)
      .its('body')
      .should('include', BLOOM_URL + '/meet-the-team');
  });
  it('therapy urls', () => {
    const THERAPY_SEGMENT = '/therapy';
    cy.request(SITEMAP_URL)
      .its('body')
      .should('include', BLOOM_URL + THERAPY_SEGMENT + '/book-session')
      .should('include', BLOOM_URL + THERAPY_SEGMENT + '/confirmed-session');
  });
  it('courses urls', () => {
    const COURSES_SEGMENT = '/courses';
    const localeSegments = ['', '/es', '/hi', '/fr', '/pt', '/de'];

    localeSegments.forEach((localeSegment) => {
      cy.request(SITEMAP_URL)
        .its('body')
        .should('include', BLOOM_URL + localeSegment + COURSES_SEGMENT)
        .should('have.length.greaterThan', 0);
    });
  });
});
