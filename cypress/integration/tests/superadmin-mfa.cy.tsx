describe('Superadmin MFA Flow', () => {
  const superAdminEmail = Cypress.env('CYPRESS_SUPER_ADMIN_EMAIL') as string;
  const superAdminPassword = Cypress.env('CYPRESS_SUPER_ADMIN_PASSWORD');
  const testPhoneNumber = '+447700900123';
  const testVerificationCode = '123456';

  before(() => {
    cy.cleanUpTestState();
  });

  beforeEach(() => {
    // Mock SMS sending and verification endpoints
    cy.intercept('POST', '**/auth/phone/verify', {
      statusCode: 200,
      body: { verificationId: 'mock-verification-id' },
    }).as('sendSMS');

    cy.intercept('POST', '**/auth/mfa/verify', {
      statusCode: 200,
      body: { success: true },
    }).as('verifyMFA');

    // Mock Firebase MFA methods
    cy.window().then((win) => {
      // Mock Firebase auth methods that would normally handle MFA
      if (win.firebase) {
        win.firebase.auth = () => ({
          currentUser: {
            multiFactor: {
              enroll: cy.stub().resolves(),
              getSession: cy.stub().resolves('mock-session'),
            },
            getIdTokenResult: cy.stub().resolves({
              token: 'mock-token',
              signInSecondFactor: null, // Initially no MFA
            }),
            reauthenticateWithCredential: cy.stub().resolves(),
          },
        });
      }
    });
  });

  it('should redirect non-logged-in users away from admin pages', () => {
    cy.visit('/admin/dashboard', { failOnStatusCode: false });
    cy.url().should('include', '/auth/login');
    // Check for return URL in query params (more flexible check)
    cy.url().should('match', /[?&](return_url|returnUrl)=/);
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
    // Create a regular user and mock them as superadmin without MFA
    const testEmail = `cypresstestemail+${Date.now()}@chayn.co`;
    const password = 'testpassword';

    cy.createUser({ emailInput: testEmail, passwordInput: password });
    cy.logInWithEmailAndPassword(testEmail, password);

    // Mock user as superadmin without MFA setup
    cy.window().then((win) => {
      if (win.store) {
        win.store.dispatch({
          type: 'user/getUser/fulfilled',
          payload: {
            user: {
              id: 'superadmin-id',
              email: testEmail,
              isSuperAdmin: true,
              MFAisSetup: false,
              verifiedEmail: true,
            },
            partnerAccesses: [],
            partnerAdmin: { id: null },
            courses: [],
            resources: [],
          },
        });
      }
    });

    cy.visit('/admin/dashboard');
    cy.get('h3').should('contain', 'Set up Two-Factor Authentication');
    cy.get('input[type="tel"]').should('exist');
    cy.get('button').contains('Send Verification Code').should('exist');

    cy.logout();
  });

  it('should complete MFA setup with phone number and verification code', () => {
    const testEmail = `cypresstestemail+${Date.now()}@chayn.co`;
    const password = 'testpassword';

    cy.createUser({ emailInput: testEmail, passwordInput: password });
    cy.logInWithEmailAndPassword(testEmail, password);

    // Mock user as superadmin without MFA setup
    cy.window().then((win) => {
      if (win.store) {
        win.store.dispatch({
          type: 'user/getUser/fulfilled',
          payload: {
            user: {
              id: 'superadmin-id',
              email: testEmail,
              isSuperAdmin: true,
              MFAisSetup: false,
              verifiedEmail: true,
            },
            partnerAccesses: [],
            partnerAdmin: { id: null },
            courses: [],
            resources: [],
          },
        });
      }
    });

    cy.visit('/admin/dashboard');

    // Enter phone number
    cy.get('input[type="tel"]').type(testPhoneNumber);
    cy.get('button').contains('Send Verification Code').click();

    // Enter verification code
    cy.get('input[id="verificationCode"]').type(testVerificationCode);
    cy.get('button').contains('Verify Code').click();

    // Should redirect to admin dashboard
    cy.url().should('include', '/admin/dashboard');
    cy.get('h2').should('contain', 'Superadmin dashboard');

    cy.logout();
  });

  it('should handle reauthentication requirement during MFA setup', () => {
    // Mock the requires-recent-login error
    cy.intercept('POST', '**/auth/phone/verify', {
      statusCode: 400,
      body: { error: { code: 'auth/requires-recent-login' } },
    }).as('requiresReauth');

    const testEmail = `cypresstestemail+${Date.now()}@chayn.co`;
    const password = 'testpassword';

    cy.createUser({ emailInput: testEmail, passwordInput: password });
    cy.logInWithEmailAndPassword(testEmail, password);

    // Mock user as superadmin without MFA setup
    cy.window().then((win) => {
      if (win.store) {
        win.store.dispatch({
          type: 'user/getUser/fulfilled',
          payload: {
            user: {
              id: 'superadmin-id',
              email: testEmail,
              isSuperAdmin: true,
              MFAisSetup: false,
              verifiedEmail: true,
            },
            partnerAccesses: [],
            partnerAdmin: { id: null },
            courses: [],
            resources: [],
          },
        });
      }
    });

    cy.visit('/admin/dashboard');
    cy.get('input[type="tel"]').type(testPhoneNumber);
    cy.get('button').contains('Send Verification Code').click();

    // Should show reauthentication form
    cy.get('h3').should('contain', 'Confirm your password');
    cy.get('p').should('contain', 'Please enter your password before continuing');
    cy.get('input[type="password"]').should('exist');
    cy.get('button').contains('Confirm').should('exist');
    cy.get('button').contains('Cancel').should('exist');

    // Enter password for reauthentication
    cy.get('input[type="password"]').type(password);
    cy.get('button').contains('Confirm').click();

    // Should return to MFA setup form
    cy.get('h3').should('contain', 'Set up Two-Factor Authentication');
    cy.get('input[type="tel"]').should('have.value', ''); // Form should be reset

    cy.logout();
  });

  it('should show MFA verification during login for users with MFA enabled', () => {
    // Mock MFA required error during login
    cy.intercept('POST', '**/auth/login', {
      statusCode: 400,
      body: { error: { code: 'auth/multi-factor-auth-required' } },
    }).as('mfaRequired');

    cy.visit('/auth/login');
    cy.get('#email').type(superAdminEmail);
    cy.get('#password').type(superAdminPassword);
    cy.get('button[type="submit"]').click();

    // Should show MFA verification form
    cy.get('h3').should('contain', 'Verify Two-Factor Authentication');
    cy.get('button').contains('Send SMS Code').should('exist');

    // Trigger SMS
    cy.get('button').contains('Send SMS Code').click();

    // Enter verification code
    cy.get('input[id="verificationCode"]').type(testVerificationCode);
    cy.get('button').contains('Verify Code').click();

    // Should redirect to admin dashboard
    cy.url().should('include', '/admin/dashboard');
  });

  it('should handle MFA setup errors gracefully', () => {
    // Mock MFA enrollment error
    cy.intercept('POST', '**/auth/mfa/verify', {
      statusCode: 400,
      body: { error: { code: 'auth/invalid-verification-code' } },
    }).as('mfaError');

    const testEmail = `cypresstestemail+${Date.now()}@chayn.co`;
    const password = 'testpassword';

    cy.createUser({ emailInput: testEmail, passwordInput: password });
    cy.logInWithEmailAndPassword(testEmail, password);

    // Mock user as superadmin without MFA setup
    cy.window().then((win) => {
      if (win.store) {
        win.store.dispatch({
          type: 'user/getUser/fulfilled',
          payload: {
            user: {
              id: 'superadmin-id',
              email: testEmail,
              isSuperAdmin: true,
              MFAisSetup: false,
              verifiedEmail: true,
            },
            partnerAccesses: [],
            partnerAdmin: { id: null },
            courses: [],
            resources: [],
          },
        });
      }
    });

    cy.visit('/admin/dashboard');
    cy.get('input[type="tel"]').type(testPhoneNumber);
    cy.get('button').contains('Send Verification Code').click();

    cy.get('input[id="verificationCode"]').type('000000'); // Wrong code
    cy.get('button').contains('Verify Code').click();

    // Should show error message
    cy.get('.MuiAlert-message').should('contain', 'Error finalizing 2FA setup');

    cy.logout();
  });

  it('should require email verification before MFA setup', () => {
    const testEmail = `cypresstestemail+${Date.now()}@chayn.co`;
    const password = 'testpassword';

    cy.createUser({ emailInput: testEmail, passwordInput: password });
    cy.logInWithEmailAndPassword(testEmail, password);

    // Mock user as superadmin with unverified email
    cy.window().then((win) => {
      if (win.store) {
        win.store.dispatch({
          type: 'user/getUser/fulfilled',
          payload: {
            user: {
              id: 'superadmin-id',
              email: testEmail,
              isSuperAdmin: true,
              MFAisSetup: false,
              verifiedEmail: false, // Email not verified
            },
            partnerAccesses: [],
            partnerAdmin: { id: null },
            courses: [],
            resources: [],
          },
        });
      }
    });

    cy.visit('/admin/dashboard');

    // Should show email verification requirement
    cy.get('p').should('contain', 'Please verify your email before setting up 2FA');
    cy.get('button').contains('Send Verification Email').should('exist');

    cy.logout();
  });
});