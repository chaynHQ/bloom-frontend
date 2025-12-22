describe('Register with Notes from Bloom', () => {
  const SUBSCRIPTION_WHATSAPP_PAGE_URL = '/subscription/whatsapp';
  const TEST_EMAIL = `cypresstestemail+${Date.now()}@chayn.co`;
  const TEST_PASSWORD = 'testpassword123';
  const TEST_NAME = 'Cypress Test User';
  const VALID_PHONE = '7123456789';
  const INVALID_PHONE = '0101';

  beforeEach(() => {
    cy.cleanUpTestState();
    cy.visit(SUBSCRIPTION_WHATSAPP_PAGE_URL);
  });

  it('should show validation errors for empty fields', () => {
    cy.get('button[type="submit"]').contains('Create account').click();

    // HTML5 validation should prevent submission and highlight required fields
    cy.get('input:invalid').should('exist');
  });

  it('should show error for invalid phone number', () => {
    cy.get('input#name').type(TEST_NAME);
    cy.get('input#email').type(TEST_EMAIL);
    cy.get('input#password').type(TEST_PASSWORD);
    cy.get('input[type="tel"]').type(INVALID_PHONE);

    cy.get('button[type="submit"]').click();

    cy.get('p').should('contain', 'Your phone number appears to be invalid');
  });

  it('should register user and subscribe to whatsapp', () => {
    // We'll use the actual user creation but mock the WhatsApp subscription
    cy.get('input#name').type(TEST_NAME);
    cy.get('input#email').type(TEST_EMAIL);
    cy.get('input#password').type(TEST_PASSWORD);
    cy.get('input[type="tel"]').type(VALID_PHONE);

    // Mock the WhatsApp subscription response
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

    // Submit the form
    cy.get('button[type="submit"]').contains('Create account').click();

    // Wait for the user to be created and logged in
    cy.url().should('include', '/account/about-you', { timeout: 10000 });
  });

  it('should handle registration errors', () => {
    // Use an existing admin email that won't be cleaned up
    const existingEmail = Cypress.env('CYPRESS_SUPER_ADMIN_EMAIL');

    // Try to register with an already existing email
    cy.get('input#name').type(TEST_NAME);
    cy.get('input#email').type(existingEmail);
    cy.get('input#password').type(TEST_PASSWORD);
    cy.get('input[type="tel"]').type(VALID_PHONE);

    // Submit the form
    cy.get('button[type="submit"]').contains('Create account').click();

    // Check that error message is displayed
    cy.get('p', { timeout: 10000 }).should('contain', 'This email is already registered with Bloom');
  });

  it('should navigate to login page when clicking login link', () => {
    cy.get('.MuiCardContent-root a').contains('Login').click();
    cy.url().should('include', '/auth/login');
  });
});
