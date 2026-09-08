// The bug / feedback / general-contact forms (components/contact/) POST straight to
// Zapier — no bloom-backend — so a logged-out visitor can use them anywhere. These
// checks cover the shared dialog, cross-form switching, validation, the device-data
// opt-in, and graceful failure. The webhook is always stubbed so release runs never
// post to the real Slack / Notion.

describe('A logged out visitor using the contact forms', () => {
  before(() => {
    cy.cleanUpTestState();
  });

  beforeEach(() => {
    cy.intercept('POST', '**hooks.zapier.com/**', { statusCode: 200, body: {} }).as('zap');
    cy.visit('/');
    cy.get('[qa-id=footer-feedback-link]', { timeout: 10000 }).click({ force: true });
  });

  it('opens the feedback form from the footer', () => {
    cy.get('[qa-id=contact-form-feedback]').should('exist');
    cy.contains('h2', 'Share your feedback').should('exist');
    // Feedback never asks for device data.
    cy.get('[qa-id=contact-device-consent]').should('not.exist');
  });

  it('switches between forms and keeps the typed message', () => {
    cy.get('[qa-id=contact-form-feedback] #contactMessage').type(
      'The library filters are confusing',
    );
    cy.get('[qa-id=contact-switch-bug]').click();

    cy.get('[qa-id=contact-form-bug]').should('exist');
    cy.get('[qa-id=contact-form-bug] #contactMessage').should(
      'have.value',
      'The library filters are confusing',
    );
    // Device opt-in appears on the bug form, unticked by default.
    cy.get('[qa-id=contact-device-consent] input[type=checkbox]').should('not.be.checked');

    cy.get('[qa-id=contact-switch-contact]').click();
    cy.get('[qa-id=contact-form-contact]').should('exist');
    cy.contains('Looking for support?').should('exist'); // support signpost
    cy.contains('a[href="/messaging"]', 'Message the Bloom team').should('exist');
  });

  it('requires a message before a bug report can be sent', () => {
    cy.get('[qa-id=contact-switch-bug]').click();
    cy.get('[qa-id=contact-form-bug] [qa-id=contact-submit]').click();
    cy.get('[qa-id=contact-error]').should('be.visible');
    cy.get('[qa-id=contact-success]').should('not.exist');
    cy.get('@zap.all').should('have.length', 0);
  });

  it('keeps the honeypot field out of view', () => {
    cy.get('input#contact-company').should('exist').and('not.be.visible');
  });

  it('submits feedback and reaches a terminal state', () => {
    cy.contains('button', 'Helpful').click();
    cy.get('[qa-id=contact-form-feedback] #contactMessage').type('Really helpful, thank you');
    cy.get('[qa-id=contact-submit]').click();

    cy.get('[qa-id=contact-success], [qa-id=contact-error]', { timeout: 8000 }).should('exist');
    cy.get('@zap.all').then((calls) => {
      // Only asserts the contract when the webhook env var is configured on the target.
      if (calls.length) {
        const body = JSON.parse(calls[0].request.body as string);
        expect(body.form_type).to.eq('feedback');
        expect(body.feedback_tags).to.contain('helpful');
        expect(body.signed_in).to.eq('false');
        expect(body.user_id).to.eq('');
        expect(body.include_device_data).to.eq('false');
        cy.get('[qa-id=contact-success]').should('exist');
      }
    });
  });

  it('shows a fallback route when the webhook call fails', () => {
    cy.intercept('POST', '**hooks.zapier.com/**', { forceNetworkError: true }).as('zapFail');
    cy.get('[qa-id=contact-switch-contact]').click();
    cy.get('[qa-id=contact-form-contact] #contactMessage').type('Testing the failure path');
    cy.get('[qa-id=contact-submit]').click();

    cy.get('[qa-id=contact-error]').should('be.visible');
    cy.get('[qa-id=contact-error] a').should('have.attr', 'href').and('not.be.empty');
    // The message the visitor typed is not lost.
    cy.get('[qa-id=contact-form-contact] #contactMessage').should(
      'have.value',
      'Testing the failure path',
    );
  });
});
