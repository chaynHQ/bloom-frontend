describe('User disable service emails page should display', () => {
  const publicEmail = Cypress.env('CYPRESS_PUBLIC_EMAIL') as string;

  before(() => {
    cy.cleanUpTestState();
    cy.logInWithEmailAndPassword(publicEmail, Cypress.env('CYPRESS_PUBLIC_PASSWORD'));
  });

  it('header section', () => {
    cy.visit('/account/disable-service-emails');
    cy.get('h1').contains('Bloom emails turned off');
    cy.checkImage('Account.disableServiceEmails.imageAlt', 'illustration_leaf_mix_bee');
  });
});
