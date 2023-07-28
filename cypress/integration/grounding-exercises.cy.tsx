describe('A logged in user should be able to navigate to grounding and do an exercise', () => {
  before(() => {
    cy.cleanUpTestState();
    cy.logInWithEmailAndPassword(Cypress.env('public_email'), Cypress.env('public_password'));
  });

  it('Should go to the grounding page and click on an exercise', () => {
    cy.get(`[qa-id=secondary-nav-grounding-button]`).should('exist').click(); //navigate to grounding

    cy.get('h3').contains('Visual breathing').should('exist').click(); //check visual breathing exercise exists and open it

    cy.get('audio[src="https://a.storyblok.com/f/142459/x/add3c95f3c/visual-breathing-gif.m4a"]') //check the audio file exists in accordian
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
