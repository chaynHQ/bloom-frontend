const welcomePageUrl = 'welcome';
const invalidPartnerPageUrl = `${welcomePageUrl}/invalid-partner`;
const libraryPageUrl = 'library';

describe('Welcome page should', () => {
  before(() => {
    cy.cleanUpTestState();
  });

  describe('Redirect to library page', () => {
    it('for a non-logged in user visiting page without partner', () => {
      cy.visit(welcomePageUrl);
      cy.checkPageUrl(libraryPageUrl);
    });
    describe('for a public logged in user', () => {
      const email = `cypresstestemail+${Date.now()}@chayn.co`;
      const password = 'testtesttest';

      before(() => {
        cy.cleanUpTestState();
        cy.createUser({ emailInput: email, passwordInput: password });
        cy.logInWithEmailAndPassword(email, password);
      });
      it('visiting page without partner', () => {
        cy.visit(welcomePageUrl);
        cy.checkPageUrl(libraryPageUrl);
      });
      after(() => {
        cy.logout();
      });
    });
  });

  it('Display not found page for an invalid partner', () => {
    cy.visit(invalidPartnerPageUrl, { failOnStatusCode: false });
    cy.get('p').contains('This page could not be found');
  });
});
