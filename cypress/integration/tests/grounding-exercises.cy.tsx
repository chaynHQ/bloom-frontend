describe('A logged in user should be able to navigate to grounding and do an exercise', () => {
  const email = `cypresstestemail+${Date.now()}@chayn.co`;
  const password = 'testtesttest';

  before(() => {
    cy.cleanUpTestState();
    cy.createUser({ emailInput: email, passwordInput: password });
    cy.logInWithEmailAndPassword(email, password);
  });

  it('Should go to the grounding page and click on an exercise', () => {
    cy.get(`[qa-id=secondary-nav-grounding-button]`).should('exist').click(); //navigate to grounding
    // Extending timeout to ensure tests don't fail because of lazy loading
    cy.get('h3', { timeout: 8000 }).contains('Visual breathing').should('exist').click(); //check visual breathing exercise exists and open it

    cy.get('audio') //check the audio file exists in accordian
      .should('exist')
      .invoke('attr', 'src')
      .then((audiofile) => {
        const audio = new Audio(audiofile);
        audio.playbackRate = 6; //speed it up by 6
        audio.play(); //try to play the recording
      });
  });

  after(() => {
    cy.logout();
  });
});
