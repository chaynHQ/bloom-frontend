const HOME_PAGE_URL = '/';

describe('Home page should display', () => {
  before(() => {
    cy.cleanUpTestState();
    cy.visit(HOME_PAGE_URL);
  });

  it('join us section', () => {
    cy.get('h1').should('contain', 'Join us on your healing journey');
    cy.get('p').should(
      'contain',
      'Bloom is here for you to learn, heal and grow towards a confident future.',
    );
    cy.checkImage(
      'Person sitting crossed legged with symbols floating around such as a video icon, flower, message icon and a persons head with a flower',
      'landing_page_illustration',
    );
    cy.checkLink('/auth/register', 'Get started');
  });
});
