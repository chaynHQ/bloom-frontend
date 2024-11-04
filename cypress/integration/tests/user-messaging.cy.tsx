describe('A logged in public user can', () => {
  const email = `cypresstestemail+${Date.now()}@chayn.co`;
  const password = 'testtesttest';

  before(() => {
    cy.cleanUpTestState();
    cy.createUser({ emailInput: email, passwordInput: password });
    cy.logInWithEmailAndPassword(email, password);
  });

  it('Navigate to the messaging page', () => {
    cy.visit('/'); // initial home page visit
    cy.get(`[qa-id=secondary-nav-messaging-button]`, { timeout: 8000 }).should('exist').click(); //go to messaging page
  });

  it('see the More about section', () => {
    cy.visit('/messaging');
    cy.get('h2').contains('Tell us what’s on your mind');
    cy.get('h2').contains('Meet the Bloom team');
    cy.get('h2').contains('More about how Bloom’s Messaging works');
    cy.checkImage('Illustration of a person sitting', 'illustration_course_dbr');
    cy.get('h3').contains('Who is 1-1 Messaging for?');
    cy.get('p').contains(
      '1-1 Messaging is available for everyone using Bloom, regardless of your background, race, age, disability, religion or belief, sexuality, gender identity or expression, or life circumstances—we are here for you.',
    );
  });

  after(() => {
    cy.logout();
  });
});
