declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to select DOM element by data-cy attribute.
     * @example cy.dataCy('greeting')
     */
    uiLogin(email: string, password: string): Chainable<Element>;
    uiLogout(): Chainable<Element>;
    createAccessCode(accessCode: {
      featureLiveChat: boolean;
      featureTherapy: boolean;
      therapySessionsRemaining: number;
      therapySessionsRedeemed: number;
    }): Chainable<any>;
    createUser({
      codeInput,
      emailInput,
      passwordInput,
      partnerId,
    }: {
      codeInput?: string;
      emailInput: string;
      passwordInput?: string;
      partnerId?: string;
    }): Chainable<Element>;

    deleteUser(): Chainable<Element>;
    deleteCypressAccessCodes(): Chainable<Element>;
    getAccessCode(): Chainable<Element>;
    getAuthEmail(): Chainable<Element>;
    clearUserState(): Chainable<Element>;
    logInWithEmailAndPassword(email: string, password: string): Chainable<Element>;
    logout(): Chainable<Element>;
    deleteAllCypressUsers(): Chainable<Element>;
    cleanUpTestState(): Chainable<Element>;
    visitGermanPage(url: string): Chainable<Element>;
    visitSpanishPage(url: string): Chainable<Element>;
    visitFrenchPage(url: string): Chainable<Element>;
    visitHindiPage(url: string): Chainable<Element>;
    visitPortuguesePage(url: string): Chainable<Element>;
    checkImage(alt: string, subSrc: string): Chainable<Element>;
    checkLink(href: string, text: string): Chainable<Element>;
    checkPageUrl(url: string, locale?: string): Chainable<Element>;
  }
}
