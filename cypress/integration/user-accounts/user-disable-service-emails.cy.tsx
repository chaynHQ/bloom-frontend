describe('User disable service emails page should display', () => {
  before(() => {
    cy.cleanUpTestState();
    cy.logInAsTestAccount('PUBLIC');
  });

  it('header section', () => {
    cy.visit('/account/disable-service-emails');
    cy.waitForAuthenticatedApp();
    cy.get('h1').contains('Bloom emails turned off');
    cy.checkImage('Account.disableServiceEmails.imageAlt', 'illustration_leaf_mix_bee');
  });
});
