describe('User disable service emails page should display', () => {
  const publicEmail = Cypress.env('CYPRESS_PUBLIC_EMAIL') as string;

  before(() => {
    cy.cleanUpTestState();
    cy.logInWithEmailAndPassword(publicEmail, Cypress.env('CYPRESS_PUBLIC_PASSWORD'));
  });

  beforeEach(() => {
    cy.visit('/account/disable-service-emails');
  });

  it('header section', () => {
    cy.get('h1').contains('Bloom emails turned off');
    cy.checkImage('Account.disableServiceEmails.imageAlt', 'illustration_leaf_mix_bee');
    cy.get('p').should(
      'contain',
      `You will no longer receive emails related to Bloom. If you'd like to change this later, please get in touch with the`,
    );
    cy.checkLink('/account/disable-service-emails#', 'Bloom team');
  });

  after(() => {
    cy.logout();
  });
});
