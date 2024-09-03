describe('User apply a code page should display', () => {
  const publicEmail = Cypress.env('CYPRESS_PUBLIC_EMAIL') as string;

  before(() => {
    cy.cleanUpTestState();
    cy.logInWithEmailAndPassword(publicEmail, Cypress.env('CYPRESS_PUBLIC_PASSWORD'));
  });

  beforeEach(() => {
    cy.visit('/account/apply-a-code');
  });

  it('header section', () => {
    cy.get('h1').should('contain', 'Apply a code');
    cy.get('p').should(
      'contain',
      'Bloom works with partners to support healing for survivors of abuse around the world.',
    );
    cy.checkImage('Illustration of a person sitting, holding a tea', 'illustration_person4_peach');
  });

  it('description', () => {
    cy.get('p').should(
      'contain',
      `If you've received an access code from one of our partners, you can add it here to receive support specific to their programme.`,
    );
    cy.get('p').should('contain', 'You can add codes from more than one partner.');
  });

  it('our partners panel', () => {
    cy.get('h3').should('contain', 'Our partners');
    cy.get('p').should('contain', 'Read more about our partnerships by clicking on their logo.');
    cy.checkImage('Bumble logo', 'bumble_logo');
    cy.checkImage('Badoo logo', 'badoo_logo');
    cy.checkImage('Fruitz logo', 'fruitz_logo');
  });

  it('apply a code panel', () => {
    cy.get('h2').should('contain', 'Apply a code');
    cy.get('p').should('contain', 'Enter the access code you received from a Bloom partner.');
    cy.get('label.Mui-required').contains('Access code');
    cy.get('input[id="accessCode"]').should('exist');
    cy.get('button').contains('Apply code');
  });

  after(() => {
    cy.logout();
  });
});
