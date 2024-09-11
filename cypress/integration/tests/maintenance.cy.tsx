// THIS TEST REQUIRES NEXT_PUBLIC_MAINTENANCE_MODE TO BE SET TO ON
// WHICH WOULD NEED AN SPECIFIC ENV VAR CONFIGURATION
// SKIPPED UNTIL SUCH CONFIGURATION IS SUPPORTED
describe.skip('Maintenance page should', () => {
  before(() => {
    cy.cleanUpTestState();
  });

  it('be displayed when NEXT_PUBLIC_MAINTENANCE_MODE is set to on', () => {
    cy.visit('/');
    cy.checkPageUrl('maintenance');
    cy.checkImage(
      'Illustration of a cycle - three suns in a circle with arrows between them',
      'illustration_change_peach',
    );
    cy.get('h2').contains('Bloom is down for maintenance');
    cy.get('p').contains(
      'Please bear with us whilst we complete some essential planned maintenance. Bloom should be available as usual within hours.',
    );
  });
});
