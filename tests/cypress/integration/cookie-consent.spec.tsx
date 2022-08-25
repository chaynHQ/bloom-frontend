describe('Cookie consent', () => {
  it('cookie should be true if user consents', () => {
    // Start from the home page
    cy.visit('/');
    // Click on cookie consent
    cy.get('[qaId="cookieConsentAcceptButton"]').click();
    // Cookie should be set
    cy.wait;
    cy.getCookie('analyticsConsent', { timeout: 5000 }).should('have.property', 'value', 'true');

    // Banner should have disappeared
    cy.get('[qaId="cookieConsentAcceptButton"]').should('not.exist');
  });
  it('cookie should be false if user consents', () => {
    // Start from the home page
    cy.visit('/');
    // Click on cookie consent
    cy.get('[qaId="cookieConsentDeclineButton"]').click();
    // Cookie should be set
    cy.getCookie('analyticsConsent', { timeout: 5000 }).should('have.property', 'value', 'false');
    // Banner should have disappeared
    cy.get('[qaId="cookieConsentAcceptButton"]').should('not.exist');
  });
});
