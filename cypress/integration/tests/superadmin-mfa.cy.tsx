describe('Superadmin MFA Flow', () => {
  const testPhoneNumber = '+447700900123';
  const testVerificationCode = '123456';

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
    const testEmail = `cypresstestemail+${Date.now()}@chayn.co`;
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
    cy.get('h3').should('contain', 'Set up Two-Factor Authentication');
    cy.get('input[type="tel"]').should('exist');
    cy.get('button').contains('Send Verification Code').should('exist');

    cy.logout();
  });

  it('should complete MFA setup with phone number and verification code', () => {
    const testEmail = `cypresstestemail+${Date.now()}@chayn.co`;
    const password = 'testpassword';

    // Mock reCAPTCHA globally for this test
    cy.window().then((win) => {
      win.grecaptcha = {
        getResponse: () => 'mock-recaptcha-token',
        render: () => 'mock-widget-id',
        reset: () => {},
        execute: () => Promise.resolve('mock-recaptcha-token')
      };
    });

    // Mock Firebase MFA enrollment endpoints
    cy.intercept('POST', '**/identitytoolkit.googleapis.com/v2/accounts/mfaEnrollment:start*', {
      statusCode: 200,
      body: {
        phoneSessionInfo: {
          sessionInfo: 'mock-session-info',
        },
      },
    }).as('mfaEnrollmentStart');

    cy.intercept('POST', '**/identitytoolkit.googleapis.com/v2/accounts/mfaEnrollment:finalize*', {
      statusCode: 200,
      body: {
        idToken: 'mock-id-token',
        refreshToken: 'mock-refresh-token',
      },
    }).as('mfaEnrollmentFinalize');

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

    // Enter phone number
    cy.get('input[type="tel"]').type(testPhoneNumber);
    cy.get('button').contains('Send Verification Code').click();

    // Validate reCAPTCHA was triggered and handle it
    cy.get('#recaptcha-container').should('exist');
    
    // Wait for the UI to update after reCAPTCHA
    cy.wait(1000);

    // Enter verification code (this will be mocked in the component)
    cy.get('input[id="verificationCode"]').type(testVerificationCode);
    cy.get('button').contains('Verify Code').click();

    // Should redirect to admin dashboard
    cy.url().should('include', '/admin/dashboard');
    cy.get('h2').should('contain', 'Superadmin dashboard');

    cy.logout();
  });

  it('should handle reauthentication requirement during MFA setup', () => {
    const testEmail = `cypresstestemail+${Date.now()}@chayn.co`;
    const password = 'testpassword';

    // Mock reCAPTCHA globally for this test
    cy.window().then((win) => {
      win.grecaptcha = {
        getResponse: () => 'mock-recaptcha-token',
        render: () => 'mock-widget-id',
        reset: () => {},
        execute: () => Promise.resolve('mock-recaptcha-token')
      };
    });

    // Mock Firebase MFA enrollment to require reauthentication first
    cy.intercept('POST', '**/identitytoolkit.googleapis.com/v2/accounts/mfaEnrollment:start*', {
      statusCode: 400,
      body: {
        error: {
          code: 400,
          message: 'CREDENTIAL_TOO_OLD_LOGIN_AGAIN',
          errors: [
            {
              message: 'CREDENTIAL_TOO_OLD_LOGIN_AGAIN',
              domain: 'global',
              reason: 'invalid',
            },
          ],
        },
      },
    }).as('mfaEnrollmentRequiresReauth');

    // Mock successful MFA enrollment after reauthentication
    cy.intercept('POST', '**/identitytoolkit.googleapis.com/v2/accounts/mfaEnrollment:start*', {
      statusCode: 200,
      body: {
        phoneSessionInfo: {
          sessionInfo: 'mock-session-info-after-reauth',
        },
      },
    }).as('mfaEnrollmentAfterReauth');

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
    cy.get('input[type="tel"]').type(testPhoneNumber);
    cy.get('button').contains('Send Verification Code').click();

    // Should show reauthentication form (this will be triggered by the component logic)
    cy.get('h3').should('contain', 'Confirm your password');
    cy.get('p').should('contain', 'Please enter your password before continuing');
    cy.get('input[type="password"]').should('exist');
    cy.get('button').contains('Confirm').should('exist');
    cy.get('button').contains('Cancel').should('exist');

    // Enter password for reauthentication
    cy.get('input[type="password"]').type(password);
    cy.get('button').contains('Confirm').click();
    // Validate reCAPTCHA was triggered initially
    cy.get('#recaptcha-container').should('exist');
  it('should require email verification before MFA setup', () => {
    const testEmail = `cypresstestemail+${Date.now()}@chayn.co`;
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
    cy.get('h3').should('contain', 'Confirm Your Identity');
    }).as('getUserUnverified');

    cy.createUser({ emailInput: testEmail, passwordInput: password });
    cy.logInWithEmailAndPassword(testEmail, password);
    cy.wait('@getUserUnverified');

    cy.visit('/admin/dashboard');

    // Should show email verification requirement
    cy.get('p').should('contain', 'Please verify your email before setting up 2FA');
    cy.get('button').contains('Send Verification Email').should('exist');
    
    // Should show phone input again (reset after reauthentication)
    cy.get('input[type="tel"]').should('exist');

    cy.logout();
  });
});
