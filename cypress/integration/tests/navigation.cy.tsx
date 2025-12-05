describe('Navigation', () => {
  before(() => {
    cy.cleanUpTestState();
  });

  describe('A non-logged in user', () => {
    it('on the home page, the nav bar should have the correct links ', () => {
      cy.visit('/');
      cy.get(`[qa-id=home-logo-link]`, { timeout: 8000 }).should('exist');
      cy.get(`[qa-id=user-menu-button]`).should('not.exist');
      cy.get(`[qa-id=language-menu-button]`).should('exist');
      cy.get(`[qa-id=meet-team-menu-button]`).should('exist');
      cy.get(`[qa-id=partner-admin-menu-button]`).should('not.exist');
      cy.get(`[qa-id=secondary-nav]`).should('exist');
      cy.get(`[qa-id=login-menu-button]`).should('exist');
      cy.get(`[qa-id=secondary-nav-therapy-button]`).should('not.exist');
      cy.get(`[qa-id=secondary-nav-notes-button]`).should('exist');
      cy.get(`[qa-id=secondary-nav-courses-button]`).should('exist');
    });
  });
  describe('A logged in public user', () => {
    const email = `cypresstestemail+${Date.now()}@chayn.co`;
    const password = 'testtesttest';
    before(() => {
      cy.cleanUpTestState();
      cy.createUser({ emailInput: email, passwordInput: password });
      cy.logInWithEmailAndPassword(email, password);
    });
    it('on the home page, the nav bar should have the correct links ', () => {
      cy.visit('/');
      cy.get(`[qa-id=home-logo-link]`, { timeout: 8000 }).should('exist');
      cy.get(`[qa-id=user-menu-button]`).should('exist');
      cy.get(`[qa-id=language-menu-button]`).should('exist');
      cy.get(`[qa-id=meet-team-menu-button]`).should('exist');
      cy.get(`[qa-id=partner-admin-menu-button]`).should('not.exist');
      cy.get(`[qa-id=secondary-nav]`).should('exist');
      cy.get(`[qa-id=login-menu-button]`).should('not.exist');
      cy.get(`[qa-id=secondary-nav-therapy-button]`).should('not.exist');
      cy.get(`[qa-id=secondary-nav-notes-button]`).should('exist');
      cy.get(`[qa-id=secondary-nav-courses-button]`).should('exist');
    });
    after(() => {
      cy.logout();
    });
  });

  describe('A logged in bumble user', () => {
    before(() => {
      const newUserEmail = `cypresstestemail+${Date.now() + 1}@chayn.co`;
      const password = 'testpassword';
      cy.cleanUpTestState();

      cy.logInWithEmailAndPassword(
        Cypress.env('CYPRESS_BUMBLE_PARTNER_ADMIN_EMAIL'),
        Cypress.env('CYPRESS_BUMBLE_PARTNER_ADMIN_PASSWORD'),
      );
      cy.wait(2000);

      cy.createAccessCode({
        featureLiveChat: true,
        featureTherapy: false,
        therapySessionsRemaining: 6,
        therapySessionsRedeemed: 0,
      }).then((res) => {
        cy.createUser({
          codeInput: res.body.accessCode,
          emailInput: newUserEmail,
          passwordInput: password,
        });
      });
      cy.logout();
      cy.cleanUpTestState();
      cy.logInWithEmailAndPassword(newUserEmail, password);
    });
    it('on the home page, the nav bar should have the correct links ', () => {
      cy.visit('/');
      cy.get(`[qa-id=home-logo-link]`, { timeout: 8000 }).should('exist');
      cy.get(`[qa-id=user-menu-button]`).should('exist');
      cy.get(`[qa-id=language-menu-button]`).should('exist');
      cy.get(`[qa-id=meet-team-menu-button]`).should('exist');
      cy.get(`[qa-id=partner-admin-menu-button]`).should('not.exist');
      cy.get(`[qa-id=secondary-nav]`).should('exist');
      cy.get(`[qa-id=login-menu-button]`).should('not.exist');
      cy.get(`[qa-id=secondary-nav-therapy-button]`).should('not.exist');
      cy.get(`[qa-id=secondary-nav-notes-button]`).should('exist');
      cy.get(`[qa-id=secondary-nav-courses-button]`).should('exist');
    });
    after(() => {
      cy.logout();
    });
  });

  describe('A logged in badoo user with therapy access', () => {
    before(() => {
      const newUserEmail = `cypresstestemail+${Date.now() + 2}@chayn.co`;
      const password = 'testpassword';
      cy.cleanUpTestState();

      cy.logInWithEmailAndPassword(
        Cypress.env('CYPRESS_BADOO_PARTNER_ADMIN_EMAIL'),
        Cypress.env('CYPRESS_BADOO_PARTNER_ADMIN_PASSWORD'),
      );
      cy.wait(2000);

      cy.createAccessCode({
        featureLiveChat: true,
        featureTherapy: true,
        therapySessionsRemaining: 6,
        therapySessionsRedeemed: 0,
      }).then((res) => {
        cy.createUser({
          codeInput: res.body.accessCode,
          emailInput: newUserEmail,
          passwordInput: password,
        });
      });
      cy.logout();
      cy.cleanUpTestState();
      cy.logInWithEmailAndPassword(newUserEmail, password);
    });
    it('on the home page, the nav bar should have the correct links ', () => {
      cy.visit('/');
      cy.get(`[qa-id=home-logo-link]`, { timeout: 8000 }).should('exist');
      cy.get(`[qa-id=user-menu-button]`).should('exist');
      cy.get(`[qa-id=language-menu-button]`).should('exist');
      cy.get(`[qa-id=meet-team-menu-button]`).should('exist');
      cy.get(`[qa-id=partner-admin-menu-button]`).should('not.exist');
      cy.get(`[qa-id=secondary-nav]`).should('exist');
      cy.get(`[qa-id=login-menu-button]`).should('not.exist');
      cy.get(`[qa-id=secondary-nav-therapy-button]`).should('exist');
      cy.get(`[qa-id=secondary-nav-notes-button]`).should('exist');
      cy.get(`[qa-id=secondary-nav-courses-button]`).should('exist');
    });
    after(() => {
      cy.logout();
    });
  });

  describe('A logged in partner admin user', () => {
    before(() => {
      cy.cleanUpTestState();

      cy.logInWithEmailAndPassword(
        Cypress.env('CYPRESS_BUMBLE_PARTNER_ADMIN_EMAIL'),
        Cypress.env('CYPRESS_BUMBLE_PARTNER_ADMIN_PASSWORD'),
      );
    });
    it('on the home page, the nav bar should have the correct links ', () => {
      cy.visit('/');
      cy.get(`[qa-id=home-logo-link]`, { timeout: 8000 }).should('exist');
      cy.get(`[qa-id=user-menu-button]`).should('exist');
      cy.get(`[qa-id=language-menu-button]`).should('exist');
      cy.get(`[qa-id=meet-team-menu-button]`).should('exist');
      cy.get(`[qa-id=partner-admin-menu-button]`).should('exist');
      cy.get(`[qa-id=secondary-nav]`).should('exist');
      cy.get(`[qa-id=login-menu-button]`).should('not.exist');
      cy.get(`[qa-id=secondary-nav-therapy-button]`).should('not.exist');
      cy.get(`[qa-id=secondary-nav-notes-button]`).should('exist');
      cy.get(`[qa-id=secondary-nav-courses-button]`).should('exist');
    });
    after(() => {
      cy.logout();
    });
  });
});
