describe('Action handler page should redirect visitor to', () => {
  const ACTION_HANDLER_URL = '/action-handler?mode=';

  before(() => {
    cy.cleanUpTestState();
  });

  it('reset password page if mode query parameter is resetPassword', () => {
    cy.visit(`${ACTION_HANDLER_URL}resetPassword`, { failOnStatusCode: false });
    cy.checkPageUrl('auth/reset-password');
  });

  it('not found page if mode query parameters has other value', () => {
    cy.visit(`${ACTION_HANDLER_URL}invalidMode`, { failOnStatusCode: false });
    cy.get('p').contains('This page could not be found');
  });
});
