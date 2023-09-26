describe('A logged in user should be able to navigate to activities and do an exercise', () => {
  before(() => {
    cy.cleanUpTestState();
    cy.logInWithEmailAndPassword(Cypress.env('public_email'), Cypress.env('public_password'));
  });

  it('Should go to the activities page and click on an exercise', () => {
    cy.get(`[qa-id=secondary-nav-activities-button]`).should('exist').click().click(); //navigate to activities - double clicking just in case
    // Default timeout is 4 seconds so extended to 8 to avoid racy tests
    cy.get('h3', { timeout: 8000 }).contains('Thought diaries').should('exist').click(); //check click first  exercise exists and open it

    cy.get('.MuiCollapse-root.MuiCollapse-entered') //check the audio file exists in accordian
      .should('exist')
      .get('p')
      .contains('Thought diaries')
      .should('exist');
  });

  after(() => {
    cy.logout();
  });
});
