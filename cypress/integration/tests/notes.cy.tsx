describe('A logged in user should be able to subscribe to notes from bloom', () => {
  before(() => {
    cy.cleanUpTestState();
    cy.logInWithEmailAndPassword(
      Cypress.env('CYPRESS_PUBLIC_EMAIL'),
      Cypress.env('CYPRESS_PUBLIC_PASSWORD'),
    );
  });

  it('Should go to the notes page and try to subscribe using an incorrect number', () => {
    cy.visit('/');
    cy.get(`[qa-id=secondary-nav-notes-button]`, { timeout: 8000 }).should('exist').click(); //navigate to notes

    cy.get('h2').contains('Subscribe to Notes from Bloom').should('exist'); //check subscribe to notes form exists

    cy.get('input[type="tel"]').should('exist').type('0101'); //type invalid number

    cy.get('button[type="submit"]').contains('Subscribe').click(); //submit form

    cy.get('p', { timeout: 3000 }).should('contain', 'Your phone number appears to be invalid'); //check the form submission fails
  });

  after(() => {
    cy.logout();
  });
});
