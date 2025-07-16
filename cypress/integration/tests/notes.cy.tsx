describe('Notes from Bloom page', () => {
  const SUBSCRIPTION_WHATSAPP_PAGE_URL = '/subscription/whatsapp';
  const INVALID_PHONE = '0101';
  const VALID_PHONE = '7123456789';

  describe('Unauthenticated user', () => {
    beforeEach(() => {
      cy.cleanUpTestState();
      cy.visit(SUBSCRIPTION_WHATSAPP_PAGE_URL);
    });

    it('should display the page header and title', () => {
      cy.get('h1').should('contain', 'Sign up to Notes from Bloom');
      cy.get('p').should('contain', 'The path to healing can be lonely and sometimes thorny');
    });

    it('should display the registration form', () => {
      cy.get('h2').should('contain', 'Create an account');
      cy.get('input#name').should('exist');
      cy.get('input#email').should('exist');
      cy.get('input#password').should('exist');
      cy.get('input[type="tel"]').should('exist');
      cy.get('button[type="submit"]').should('contain', 'Create account');
      cy.get('a').contains('Login').should('exist');
    });

    it('should display the "How Notes from Bloom works" section', () => {
      cy.get('h2').should('contain', 'How Notes from Bloom works');
      cy.get('img[alt="Example of Notes from Bloom WhatsApp messages"]').should('exist');
    });
  });

  describe('Authenticated user - not subscribed', () => {
    const TEST_EMAIL = `cypresstestemail+${Date.now()}@chayn.co`;
    const TEST_PASSWORD = 'testpassword123';

    before(() => {
      cy.cleanUpTestState();
      cy.createUser({ emailInput: TEST_EMAIL, passwordInput: TEST_PASSWORD });
    });

    beforeEach(() => {
      cy.cleanUpTestState();
      cy.logInWithEmailAndPassword(TEST_EMAIL, TEST_PASSWORD);

      // Mock empty subscriptions response
      cy.intercept('GET', '**/subscription-user', []).as('getSubscriptions');

      cy.visit(SUBSCRIPTION_WHATSAPP_PAGE_URL);
      cy.wait('@getSubscriptions');
    });

    it('should display the subscription form for non-subscribed user', () => {
      cy.get('h2').should('contain', 'Subscribe to Notes');
      cy.get('p').should(
        'contain',
        'Subscribe to Notes from Bloom to start receiving whatsapp messages',
      );
      cy.get('input[type="tel"]').should('exist');
      cy.get('button[type="submit"]').should('contain', 'Subscribe');
    });

    it('should display the "How Notes from Bloom works" section', () => {
      cy.get('h2').should('contain', 'How Notes from Bloom works');
      cy.get('img[alt="Example of Notes from Bloom WhatsApp messages"]').should('exist');
    });

    it('should show error for invalid phone number', () => {
      cy.get('input[type="tel"]').type(INVALID_PHONE);
      cy.get('button[type="submit"]').contains('Subscribe').click();

      cy.get('p').should('contain', 'Your phone number appears to be invalid');
    });

    it('should handle successful subscription', () => {
      // Mock successful subscription response
      cy.intercept('POST', '**/subscription-user/whatsapp', {
        statusCode: 200,
        body: {
          id: 'test-subscription-id',
          subscriptionName: 'whatsapp',
          subscriptionInfo: VALID_PHONE,
          createdAt: new Date().toISOString(),
          cancelledAt: null,
        },
      }).as('subscribeToWhatsapp');

      cy.get('input[type="tel"]').type(VALID_PHONE);
      cy.get('button[type="submit"]').contains('Subscribe').click();

      cy.wait('@subscribeToWhatsapp');

      // After successful subscription, the page should reload and show updated subscriptions
      // Mock the updated subscriptions response
      cy.intercept('GET', '**/subscription-user', [
        {
          id: 'test-subscription-id',
          subscriptionName: 'whatsapp',
          subscriptionInfo: VALID_PHONE,
          createdAt: new Date().toISOString(),
          cancelledAt: null,
        },
      ]).as('getUpdatedSubscriptions');

      cy.visit(SUBSCRIPTION_WHATSAPP_PAGE_URL);
      cy.wait('@getUpdatedSubscriptions');

      // Now we should see the unsubscribe form
      cy.get('h2').should('contain', "You're subscribed to Notes");
    });

    after(() => {
      cy.logout();
    });
  });

  describe('Authenticated user - subscribed', () => {
    const TEST_EMAIL = `cypresstestemail+${Date.now()}@chayn.co`;
    const TEST_PASSWORD = 'testpassword123';
    const PHONE_NUMBER = '+447700900000';

    before(() => {
      cy.cleanUpTestState();
      cy.createUser({ emailInput: TEST_EMAIL, passwordInput: TEST_PASSWORD });
    });

    beforeEach(() => {
      cy.cleanUpTestState();
      cy.logInWithEmailAndPassword(TEST_EMAIL, TEST_PASSWORD);

      // Mock subscriptions response with active WhatsApp subscription
      cy.intercept('GET', '**/subscription-user', [
        {
          id: 'test-subscription-id',
          subscriptionName: 'whatsapp',
          subscriptionInfo: PHONE_NUMBER,
          createdAt: new Date().toISOString(),
          cancelledAt: null,
        },
      ]).as('getSubscriptions');

      cy.visit(SUBSCRIPTION_WHATSAPP_PAGE_URL);
      cy.wait('@getSubscriptions');
    });

    it('should display the unsubscribe form for subscribed user', () => {
      cy.get('h2').should('contain', "You're subscribed to Notes");
      cy.get('p').should(
        'contain',
        'Unsubscribe from Notes from Bloom to stop receiving whatsapp messages',
      );
      cy.get('button').should('contain', 'Unsubscribe');
      cy.get('body').should('contain', PHONE_NUMBER);
    });

    it('should handle unsubscription', () => {
      // Mock successful unsubscription response
      cy.intercept('PATCH', '**/subscription-user/whatsapp/*', {
        statusCode: 200,
        body: {
          id: 'test-subscription-id',
          subscriptionName: 'whatsapp',
          subscriptionInfo: PHONE_NUMBER,
          createdAt: new Date().toISOString(),
          cancelledAt: new Date().toISOString(),
        },
      }).as('unsubscribeFromWhatsapp');

      cy.get('button').contains('Unsubscribe').click();
      cy.wait('@unsubscribeFromWhatsapp');

      // After successful unsubscription, the page should reload and show empty subscriptions
      // Mock the updated subscriptions response
      cy.intercept('GET', '**/subscription-user', []).as('getEmptySubscriptions');

      cy.visit(SUBSCRIPTION_WHATSAPP_PAGE_URL);
      cy.wait('@getEmptySubscriptions');

      // Now we should see the subscribe form again
      cy.get('h2').should('contain', 'Subscribe to Notes');
    });

    after(() => {
      cy.logout();
    });
  });
});
