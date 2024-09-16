describe('Action handler page should redirect visitor to', () => {
  const ACTION_HANDLER_URL = '/action-handler?mode=';
  const MODE_VALUE = 'resetPassword';

  before(() => {
    cy.cleanUpTestState();
  });

  it('reset password page if mode query parameter is resetPassword', () => {
    cy.visit(`${ACTION_HANDLER_URL}${MODE_VALUE}`);
    cy.checkPageUrl('auth/reset-password');
  });
  it('not found page if mode query parameters has other value', () => {
    const modeValue = 'wrongMode';
    cy.visit(`${ACTION_HANDLER_URL}${modeValue}`);
    cy.checkPageUrl('404');
  });
});
