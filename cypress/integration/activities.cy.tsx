describe('A logged in user should be able to navigate to activities and do an exercise', () => {
  before(() => {
    cy.cleanUpTestState();
    cy.logInWithEmailAndPassword(Cypress.env('public_email'), Cypress.env('public_password'));
  });

  it('Should go to the activities page and click on an exercise', () => {
    cy.get(`[qa-id=secondary-nav-activities-button]`).should('exist').click(); //navigate to activities

    cy.get('h3').contains('Thought diaries').should('exist').click(); //check thought diaries exercise exists and open it

    // WIP until Activities page is finalised
  });

  after(() => {
    cy.logout();
  });
});
