describe('A logged in public user can', () => {
  const email = `cypresstestemail+${Date.now()}@chayn.co`;
  const password = 'testtesttest';

  before(() => {
    cy.cleanUpTestState();
    cy.createUser({ emailInput: email, passwordInput: password });
    cy.logInWithEmailAndPassword(email, password);
  });

  it('Navigate to the chat page and begin a chat', () => {
    cy.visit('/'); //intitial home page visit
    cy.get(`[qa-id=secondary-nav-chat-button]`, { timeout: 8000 }).should('exist').click(); //go to chat page
  });

  it('see the More about section', () => {
    cy.visit('/messaging');
    cy.get('h2').contains('More about how 1-1 Chat works');
    cy.checkImage('alt', 'illustration_leaf_mix');
    cy.get('p').contains('Who am I speaking to? Am I always chatting with the same person?');
    cy.get('p').contains(
      'We are a group of survivors and allies based all over the world who care about your healing journey. Because of our different time zones and the way we run our chat service, you won’t always be speaking with the same person. You can find out more about our team and who we are',
    );
  });

  after(() => {
    cy.logout();
  });
});
