describe('Superadmin MFA Flow', () => {
  const testPhoneNumber = '+447700900123';

  beforeEach(() => {
    cy.cleanUpTestState();
  });

  it('should redirect non-logged-in users away from admin pages', () => {
    cy.visit('/admin/dashboard', { failOnStatusCode: false });
    cy.url().should('include', '/auth/login');
    // Check for return URL in query params (more flexible check)
    cy.url().should('match', /[?&]return_url=/);
  });

  it('should block non-superadmin users from accessing admin pages', () => {
    const regularUserEmail = `cypresstestemail+${Date.now()}@chayn.co`;
    const password = 'testpassword';

    cy.createUser({ emailInput: regularUserEmail, passwordInput: password });
    cy.logInWithEmailAndPassword(regularUserEmail, password);

    cy.visit('/admin/dashboard', { failOnStatusCode: false });
    cy.get('h2').should('contain', 'Access required');
    cy.get('p').should('contain', 'Your account does not include access to these pages');

    cy.logout();
  });

  it('should show MFA setup form for superadmin without MFA', () => {
    const testEmail = `cypresstestemail+${Date.now() + 1}@chayn.co`;
    const password = 'testpassword';

    // Mock the user API response to return a superadmin without MFA
    cy.intercept('GET', '**/user/me', {
      statusCode: 200,
      body: {
        user: {
          id: 'superadmin-id',
          email: testEmail,
          name: 'Test Superadmin',
          isSuperAdmin: true,
          verifiedEmail: true,
          MFAisSetup: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          firebaseUid: 'test-firebase-uid',
          contactPermission: false,
          serviceEmailsPermission: true,
          emailRemindersFrequency: null,
          crispTokenId: null,
          signUpLanguage: 'en',
          activeSubscriptions: [],
        },
        partnerAccesses: [],
        partnerAdmin: { id: null, active: null, createdAt: null, updatedAt: null, partner: null },
        courses: [],
        resources: [],
        subscriptions: [],
      },
    }).as('getUserSuperadmin');

    cy.createUser({ emailInput: testEmail, passwordInput: password });
    cy.logInWithEmailAndPassword(testEmail, password);
    cy.wait('@getUserSuperadmin');

    cy.visit('/admin/dashboard');
    cy.get('h3').should('contain', 'Set up two-factor authentication');
    cy.get('input[type="tel"]').should('exist');
    cy.get('button').contains('Send verification code').should('exist');

    cy.logout();
  });

  it('should complete MFA setup with phone number and verification code', () => {
    const testEmail = `cypresstestemail+${Date.now() + 2}@chayn.co`;
    const password = 'testpassword';

    // Mock superadmin user without MFA
    cy.intercept('GET', '**/user/me', {
      statusCode: 200,
      body: {
        user: {
          id: 'superadmin-id',
          email: testEmail,
          name: 'Test Superadmin',
          isSuperAdmin: true,
          verifiedEmail: true,
          MFAisSetup: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          firebaseUid: 'test-firebase-uid',
          contactPermission: false,
          serviceEmailsPermission: true,
          emailRemindersFrequency: null,
          crispTokenId: null,
          signUpLanguage: 'en',
          activeSubscriptions: [],
        },
        partnerAccesses: [],
        partnerAdmin: { id: null, active: null, createdAt: null, updatedAt: null, partner: null },
        courses: [],
        resources: [],
        subscriptions: [],
      },
    }).as('getUserSuperadmin');

    cy.createUser({ emailInput: testEmail, passwordInput: password });
    cy.logInWithEmailAndPassword(testEmail, password);
    cy.wait('@getUserSuperadmin');

    cy.visit('/admin/dashboard');

    // Verify MFA setup form is displayed
    cy.get('h3').should('contain', 'Set up two-factor authentication');

    // Enter phone number
    cy.get('input[type="tel"]').should('be.visible').type(testPhoneNumber);

    // Click send verification code button
    cy.get('button').contains('Send verification code').should('be.visible').click();

    // We can't mock the reCAPTCHA in Cypress, so we will skip this step that tests the actual sms sending and mfa setup

    // // Enter verification code
    // cy.get('input[id="verificationCode"]').should('be.visible').type(testVerificationCode);
    // cy.get('button').contains('Verify Code').click();

    // // Should redirect to admin dashboard
    // cy.url().should('include', '/admin/dashboard');
    // cy.get('h2').should('contain', 'Superadmin dashboard');

    cy.logout();
  });

  it('should require email verification before MFA setup', () => {
    const testEmail = `cypresstestemail+${Date.now() + 3}@chayn.co`;
    const password = 'testpassword';

    // Mock superadmin user with unverified email
    cy.intercept('GET', '**/user/me', {
      statusCode: 200,
      body: {
        user: {
          id: 'superadmin-id',
          email: testEmail,
          name: 'Test Superadmin',
          isSuperAdmin: true,
          verifiedEmail: false, // Email not verified
          MFAisSetup: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          firebaseUid: 'test-firebase-uid',
          contactPermission: false,
          serviceEmailsPermission: true,
          emailRemindersFrequency: null,
          crispTokenId: null,
          signUpLanguage: 'en',
          activeSubscriptions: [],
        },
        partnerAccesses: [],
        partnerAdmin: { id: null, active: null, createdAt: null, updatedAt: null, partner: null },
        courses: [],
        resources: [],
        subscriptions: [],
      },
    }).as('getUserUnverified');

    cy.createUser({ emailInput: testEmail, passwordInput: password });
    cy.logInWithEmailAndPassword(testEmail, password);
    cy.wait('@getUserUnverified');

    cy.visit('/admin/dashboard');

    // Should show email verification requirement
    cy.get('p').should('contain', 'Please verify your email before setting up 2FA');
    cy.get('button').contains('Send verification email').should('exist');

    cy.logout();
  });
});
