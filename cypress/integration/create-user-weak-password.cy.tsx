describe('Create User', () => {
  let username = `cypresstestemail+${Date.now()}@chayn.co`;
  before(() => {
    cy.cleanUpTestState();
  });

  it('Should not be able to create user with a weak password', () => {
    // Start from the home page
    cy.visit('/');
    cy.wait(2000);
    // TODO put the correct home page check below when it is published
    // cy.get('h2', { timeout: 8000 }).contains('Get started').should('exist');
    // TODO - workout why #primary-get-started-button works locallly and headless but not in github actions
    cy.get('a[qa-id="primary-get-started-button"]', { timeout: 10000 })
      .first()
      .click({ force: true });
    cy.wait(2000);
    cy.get('h2', { timeout: 10000 }).should('contain', 'Create account');
    cy.get('#name', { timeout: 10000 }).type('Cypress test');
    cy.get('#email', { timeout: 10000 }).type(username);
    cy.get('#password', { timeout: 10000 }).type('123');
    cy.get('button[type="submit"]').contains('Create account').click();
    cy.wait(3000);
    cy.get('p', { timeout: 10000 }).should(
      'contain',
      "Your password needs to be a little longer, so it's more secure.",
    );
  });
});
