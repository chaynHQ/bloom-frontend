describe('Sitemap should have', () => {
  const SITEMAP_URL = '/sitemap.xml';
  // The sitemap lists URLs on the origin the app is served from.
  const BLOOM_URL = Cypress.config('baseUrl');
  before(() => {
    cy.cleanUpTestState();
  });

  it('bloom url', () => {
    cy.request(SITEMAP_URL).its('body').should('include', BLOOM_URL);
  });
  it('meet the team url', () => {
    cy.request(SITEMAP_URL)
      .its('body')
      .should('include', BLOOM_URL + '/meet-the-team');
  });
});
