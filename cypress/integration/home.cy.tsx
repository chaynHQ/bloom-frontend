before(() => {
  //Delete all cypress test users before cypress test runs
  cy.visit('/');
  cy.logInWithEmailAndPassword(
    Cypress.env('super_admin_user'),
    Cypress.env('super_admin_password'),
  );
  cy.deleteAllCypressUsers();
  cy.logout();
});
describe('Home page', () => {
  it('should render', () => {
    cy.visit('/');
    cy.get('p', { timeout: 5000 }).contains(
      'Learn and heal from trauma in a private, supportive space.',
    );
  });
});
