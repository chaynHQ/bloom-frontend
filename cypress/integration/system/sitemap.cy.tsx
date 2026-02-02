describe('Sitemap should have', () => {
  const SITEMAP_URL = '/sitemap.xml';
  const BLOOM_URL = 'https://bloom.chayn.co';
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
