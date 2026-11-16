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
      const email = Cypress.uniqueEmail();
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

  it('Display a launched partner', () => {
    cy.visit(`${welcomePageUrl}/bumble`);
    cy.get('[qa-id="welcome-intro"] h1').should('exist');
    cy.get('img[alt="Bloom in partnership with Bumble logo"]').should('exist');
  });

  // Fruitz has a partner story but no welcome page; nonsense is no partner at all.
  ['fruitz', 'nonsense'].forEach((slug) => {
    it(`Display not found page for ${slug}`, () => {
      cy.visit(`${welcomePageUrl}/${slug}`, { failOnStatusCode: false });
      cy.get('p').contains('This page could not be found');
    });
  });
});

describe('Partner branding from a URL', () => {
  it('is not shown for ?partner=fruitz, which is not launched', () => {
    cy.visit('/?partner=fruitz');
    cy.get('footer').should('contain', 'Built by');
    cy.get('footer').should('not.contain', 'FRUITZ LTD');
    cy.get('footer img[alt="Fruitz logo"]').should('not.exist');
  });

  it('is not shown on register for ?partner=nonsense', () => {
    cy.visit('/auth/register?partner=nonsense');
    cy.get('h1', { timeout: 8000 }).should('contain', 'Create account');
    cy.get('img[alt="Bloom logo"]').should('exist');
    cy.get('img[alt*="nonsense"]').should('not.exist');
    cy.get('#partnerAccessCode').should('not.exist');
    cy.get('footer').should('not.contain', 'In partnership with');
  });
});
