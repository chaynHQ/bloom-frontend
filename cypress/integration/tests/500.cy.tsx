describe('Custom 500 page should', () => {
  before(() => {
    cy.cleanUpTestState();
  });

  beforeEach(() => {
    cy.visit('/500', { failOnStatusCode: false });
  });

  it('Should display', () => {
    cy.checkImage(
      `Illustration of a person's face and shoulders, with big leaves and flowers blooming above them`,
      'illustration_bloom_head',
    );
    cy.get('h1').contains('500 - Internal error');
    cy.get('p').contains(
      'Hmm, something went wrong there. Please go back and try again. Get in touch via the contact form if the error continues.',
    );
  });

  it('Should be redirected to courses when clicking Back to welcome page', () => {
    const buttonText = 'Back to welcome page';
    cy.checkLink('/login', buttonText);
    cy.get('a').contains(buttonText).click();
    cy.checkPageUrl('courses');
  });
});
