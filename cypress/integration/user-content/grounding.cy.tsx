describe('Grounding exercises', () => {
  // Grounding is fully public — no login required, matching the resource_grounding schema
  // (no login_required field) and the Figma design (CTA banners, not a login wall).
  it('opens an exercise from the card grid and closes it', () => {
    cy.visit('/grounding');

    cy.get('[qa-id=grounding-card]', { timeout: 10000 })
      .contains('Visual breathing')
      .should('be.visible')
      .click();

    cy.get('[qa-id=grounding-exercise-dialog]', { timeout: 10000 })
      .should('be.visible')
      .contains('Visual breathing');

    cy.location('search').should('include', 'id=grounding-visual-breathing');

    cy.get('[qa-id=grounding-exercise-dialog] button').contains(/close/i).click();

    cy.get('[qa-id=grounding-exercise-dialog]').should('not.exist');
    cy.location('search').should('not.include', 'id=');
  });

  it('opens the matching exercise when linked to directly via ?id=', () => {
    cy.visit('/grounding?id=grounding-visual-breathing');

    cy.get('[qa-id=grounding-exercise-dialog]', { timeout: 10000 })
      .should('be.visible')
      .contains('Visual breathing');
  });

  it('still opens via the legacy ?openacc= query param used by old grounding links', () => {
    cy.visit('/grounding?openacc=grounding-visual-breathing');

    cy.get('[qa-id=grounding-exercise-dialog]', { timeout: 10000 })
      .should('be.visible')
      .contains('Visual breathing');
  });
});
