describe('Meet The Team', () => {
  before(() => {
    cy.cleanUpTestState();
  });

  it('User should be able to navigate to the meet the team in english', () => {
    // Start from the home page
    cy.visit('/');
    cy.wait(2000);
    cy.get('a[qa-id="meet-team-menu-button"]', { timeout: 10000 }).first().click({ force: true });
    cy.wait(2000);
    cy.get('h1', { timeout: 10000 }).should('contain', 'Our Bloom team');
    cy.get('p', { timeout: 10000 }).should(
      'contain',
      'Our team comes from all corners of the world. We deeply care about the experiences of survivors and the many ways in which our identity affects our experience of trauma, as many of us, are survivors ourselves',
    );
    cy.get('h2', { timeout: 10000 }).should('contain', 'Core team');
    cy.get('h3', { timeout: 10000 }).should('contain', 'Our volunteers');
    cy.get('p', { timeout: 10000 }).should(
      'contain',
      'Chayn began as a volunteer-run network of survivors and allies that wanted to create a feminist space online for information, solidarity and healing. Our volunteers continue to play an important part in informing, reviewing and designing our services.',
    );
    cy.get('h3', { timeout: 10000 }).should('contain', 'Our therapists');
    cy.get('p', { timeout: 10000 }).should(
      'contain',
      'We co-create our courses with a network of certified therapists who practice a trauma-informed and feminist approach. They are based all across the world, and speak many languages.',
    );
    cy.get('h2', { timeout: 10000 }).should('contain', 'Supporting team');
    cy.get('p', { timeout: 10000 }).should(
      'contain',
      'Our wider team has helped us edit, write, and record our course videos, and some of them also provide support over 1-1 chat. They bring with them a wealth of knowledge and life experience, and have been trained by Chayn. You may even come across someone who is based in the same place as you!',
    );
    cy.get('h2', { timeout: 10000 }).should('contain', 'Our research and awards');
    cy.get('h2', { timeout: 10000 }).should('contain', 'Funded by');
  });
});
