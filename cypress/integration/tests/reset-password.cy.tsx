import { MailSlurp } from 'mailslurp-client';

const email = `cypresstestemail+${Date.now()}@chayn.co`;

const resetPasswordPath = 'auth/reset-password';

describe('Reset password', () => {
  before(() => {
    cy.cleanUpTestState();
    // we need to create a user as there are reset password limits
    cy.createUser({
      emailInput: email,
      passwordInput: 'testpassword',
    });
  });
  it('should navigate to the reset password page', () => {
    // Start from the home page
    cy.visit('/');

    // Find a link with an href attribute containing "login" and click it
    cy.get('a[href*="login"]', { timeout: 8000 }).click();

    // The new url should include "login"
    cy.url().should('include', 'auth/login');

    // Find a link with an href attribute containing "reset-password" and click it
    cy.get('a[href*="reset-password"]').click();

    cy.url().should('include', resetPasswordPath);

    // The new page should contain an h2 with "Reset your password"
    cy.get('h2', { timeout: 8000 }).contains('Reset your password');
  });

  it('should receive email when known email submitted for password reset', () => {
    const mailslurp = new MailSlurp({ apiKey: Cypress.env('CYPRESS_MAIL_SLURP_API_KEY') });

    const inboxId = Cypress.env('CYPRESS_INBOX_ID');

    // Retrieve inbox
    mailslurp.getInbox(inboxId).then((inbox) => {
      // Reset password
      cy.visit(resetPasswordPath);
      cy.wait(1000); // Waiting for dom to rerender as the email input was detaching
      cy.get('[qa-id=passwordResetEmailInput]', { timeout: 8000 }).focus().type(email);
      cy.get('p', { timeout: 8000 })
        // check that front-end confirms an email has been sent
        .should('contain', 'Check your emails for a reset link from Bloom.');
      cy.get('button[type="submit"]').contains('Resend email');

      // wait for email
      mailslurp.waitForLatestEmail(inbox.id, 8000).then((latestEmail) => {
        expect(latestEmail.subject).contains('Reset');
      });
    });
  });
});
