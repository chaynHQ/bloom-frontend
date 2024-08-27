const welcomePageUrl = 'welcome';
const invalidPartnerPageUrl = `${welcomePageUrl}/invalid-partner`;
const coursesPageUrl = 'courses';

describe('Welcome page should', () => {
  before(() => {
    cy.cleanUpTestState();
  });

  describe('Redirect to courses page', () => {
    it('for a non-logged in user visiting page without partner', () => {
      cy.visit(welcomePageUrl);
      cy.checkPageUrl(coursesPageUrl);
    });
    describe('for a public logged in user', () => {
      before(() => {
        cy.cleanUpTestState();
        cy.logInWithEmailAndPassword(
          Cypress.env('CYPRESS_PUBLIC_EMAIL'),
          Cypress.env('CYPRESS_PUBLIC_PASSWORD'),
        );
      });
      it('visiting page without partner', () => {
        cy.visit(welcomePageUrl);
        cy.checkPageUrl(coursesPageUrl);
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
