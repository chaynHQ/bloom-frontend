describe('Cookie consent', () => {
  before(() => {
    cy.cleanUpTestState();
  });
  it('cookie should be true if user consents', () => {
    // Start from the home page
    cy.visit('/');
    // Click on cookie consent
    cy.get('[qa-id="cookieConsentAcceptButton"]').click();
    // Cookie should be set
    cy.wait;
    cy.getCookie('analyticsConsent', { timeout: 8000 }).should('have.property', 'value', 'true');

    // Banner should have disappeared
    cy.get('[qa-id="cookieConsentAcceptButton"]').should('not.exist');
  });
  it('cookie should be false if user consents', () => {
    // Start from the home page
    cy.visit('/');
    // Click on cookie consent
    cy.get('[qa-id="cookieConsentDeclineButton"]').click();
    // Cookie should be set
    cy.getCookie('analyticsConsent', { timeout: 8000 }).should('have.property', 'value', 'false');
    // Banner should have disappeared
    cy.get('[qa-id="cookieConsentAcceptButton"]').should('not.exist');
  });

  // The PWA install banner shares this bottom inline end slot, so the cookie banner must stay
  // inside the viewport and clear the mobile bottom nav on every screen size.
  const bottomNavHeight = 100;
  const viewports: { name: string; size: [number, number]; hasBottomNav: boolean }[] = [
    { name: 'mobile', size: [375, 667], hasBottomNav: true },
    { name: 'tablet', size: [834, 1112], hasBottomNav: true },
    { name: 'desktop', size: [1440, 900], hasBottomNav: false },
  ];

  viewports.forEach(({ name, size, hasBottomNav }) => {
    it(`banner is anchored to the bottom of the viewport on ${name}`, () => {
      cy.viewport(size[0], size[1]);
      cy.visit('/');
      cy.get('[qa-id="cookieConsentAcceptButton"]').should('be.visible');

      cy.get('.CookieConsent').then(($banner) => {
        const banner = $banner[0].getBoundingClientRect();

        cy.window().then((window) => {
          // Fully on screen horizontally, anchored to the inline end (right in LTR).
          expect(banner.left).to.be.at.least(0);
          expect(banner.right).to.be.at.most(window.innerWidth);
          expect(window.innerWidth - banner.right).to.be.at.most(banner.left);
          // Sits at the bottom, above the mobile bottom nav where that is rendered.
          expect(banner.bottom).to.be.at.most(
            window.innerHeight - (hasBottomNav ? bottomNavHeight : 0),
          );
          expect(banner.bottom).to.be.greaterThan(window.innerHeight / 2);
        });
      });
    });
  });
});
