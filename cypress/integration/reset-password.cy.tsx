import { MailSlurp } from 'mailslurp-client';

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

    cy.url().should('include', Cypress.env('reset_password_path'));

    // The new page should contain an h2 with "Reset your password"
    cy.get('h2').contains('Reset your password');
  });

  it('should see resend-link button after typing known email', () => {
    cy.visit(Cypress.env('reset_password_path'));
    cy.wait(1000); // Waiting for dom to rerender as the email input was detaching
    cy.get('[qa-id=passwordResetEmailInput]').type(`${Cypress.env('reset_pwd_confirm_email')}`);
    cy.get('[qa-id=passwordResetEmailButton]').click();

    cy.get('p', { timeout: 5000 }).should(
      'contain',
      'Check your emails for a reset link from Bloom.',
    );
    cy.get('button[type="submit"]').contains('Resend email');
  });

  it('should receive email when known email submitted for password reset', async () => {
    const mailslurp = new MailSlurp({ apiKey: Cypress.env('mail_slurp_api_key') });

    const inboxId = Cypress.env('inbox_id');
    const email = Cypress.env('reset_pwd_content_email');

    // Retrieve inbox
    const inbox = await mailslurp.getInbox(inboxId);

    // Reset password
    cy.visit(Cypress.env('reset_password_path'));
    cy.get('[qa-id=passwordResetEmailInput]').focus().type(`${email}{enter}`);
    cy.get('p', { timeout: 3000 })
      // check that front-end confirms an email has been sent
      .should('contain', 'Check your emails for a reset link from Bloom.')
      .then(async () => {
        // wait for email
        const latestEmail = await mailslurp.waitForLatestEmail(inbox.id, 5000);
        expect(latestEmail.subject).contains('Reset');
      });
  });
});
