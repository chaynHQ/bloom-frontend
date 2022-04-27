describe('Reset password', () => {
  it('should navigate to the reset password page', () => {
    // Start from the home page
    cy.visit('/');

    // Find a link with an href attribute containing "login" and click it
    cy.get('a[href*="login"]').click();

    // The new url should include "login"
    cy.url().should('include', Cypress.env('login_path'));

    // Find a link with an href attribute containing "reset-password" and click it
    cy.get('a[href*="reset-password"]').click();

    cy.url().should('include', Cypress.env('reset-password-path'));

    // The new page should contain an h2 with "Reset your password"
    cy.get('h2').contains('Reset your password');
  });
});
