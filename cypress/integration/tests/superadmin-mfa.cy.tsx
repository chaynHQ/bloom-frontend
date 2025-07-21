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

  describe('Access Control', () => {
    it('should redirect non-logged-in users away from admin pages', () => {
      cy.visit('/admin/dashboard', { failOnStatusCode: false });
      cy.url().should('include', '/auth/login');
      cy.get('input[name="return_url"]').should('exist');
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

    it('should block superadmin users without MFA from accessing admin pages', () => {
      // Mock superadmin without MFA setup
      cy.window().then((win) => {
        if (win.store) {
          win.store.dispatch({
            type: 'user/setUserToken',
            payload: 'mock-token',
          });
          win.store.dispatch({
            type: 'user/getUser/fulfilled',
            payload: {
              user: {
                id: 'superadmin-id',
                email: superAdminEmail,
                isSuperAdmin: true,
                MFAisSetup: false,
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
      cy.url().should('include', '/auth/login');
    });
  });

  describe('MFA Setup Flow', () => {
    beforeEach(() => {
      cy.logInWithEmailAndPassword(superAdminEmail, superAdminPassword);
    });

    afterEach(() => {
      cy.logout();
    });

    it('should show MFA setup form for superadmin without MFA', () => {
      // The login should automatically redirect to MFA setup
      cy.get('h3').should('contain', 'Set up Two-Factor Authentication');
      cy.get('input[type="tel"]').should('exist');
      cy.get('button').contains('Send Verification Code').should('exist');
    });

    it('should handle phone number input and SMS sending', () => {
      cy.get('h3').should('contain', 'Set up Two-Factor Authentication');

      // Enter phone number
      cy.get('input[type="tel"]').type(testPhoneNumber);
      cy.get('button').contains('Send Verification Code').click();

      // Should show verification code input
      cy.get('p').should('contain', 'Please enter the verification code we sent to your phone');
      cy.get('input[id="verificationCode"]').should('exist');
      cy.get('button').contains('Verify Code').should('exist');
    });

    it('should complete MFA setup with verification code', () => {
      // Enter phone number
      cy.get('input[type="tel"]').type(testPhoneNumber);
      cy.get('button').contains('Send Verification Code').click();

      // Enter verification code
      cy.get('input[id="verificationCode"]').type(testVerificationCode);
      cy.get('button').contains('Verify Code').click();

      // Should redirect to admin dashboard
      cy.url().should('include', '/admin/dashboard');
      cy.get('h2').should('contain', 'Superadmin dashboard');
    });

    it('should handle reauthentication requirement', () => {
      // Mock the requires-recent-login error
      cy.intercept('POST', '**/auth/phone/verify', {
        statusCode: 400,
        body: { error: { code: 'auth/requires-recent-login' } },
      }).as('requiresReauth');

      cy.get('input[type="tel"]').type(testPhoneNumber);
      cy.get('button').contains('Send Verification Code').click();

      // Should show reauthentication form
      cy.get('h3').should('contain', 'Confirm your password');
      cy.get('p').should('contain', 'Please enter your password before continuing');
      cy.get('input[type="password"]').should('exist');
      cy.get('button').contains('Confirm').should('exist');
      cy.get('button').contains('Cancel').should('exist');
    });

    it('should handle reauthentication flow', () => {
      // Mock the requires-recent-login error first
      cy.intercept('POST', '**/auth/phone/verify', {
        statusCode: 400,
        body: { error: { code: 'auth/requires-recent-login' } },
      }).as('requiresReauth');

      cy.get('input[type="tel"]').type(testPhoneNumber);
      cy.get('button').contains('Send Verification Code').click();

      // Enter password for reauthentication
      cy.get('input[type="password"]').type(superAdminPassword);
      cy.get('button').contains('Confirm').click();

      // Should return to MFA setup form
      cy.get('h3').should('contain', 'Set up Two-Factor Authentication');
      cy.get('input[type="tel"]').should('have.value', ''); // Form should be reset
    });

    it('should handle wrong password during reauthentication', () => {
      // Mock the requires-recent-login error first
      cy.intercept('POST', '**/auth/phone/verify', {
        statusCode: 400,
        body: { error: { code: 'auth/requires-recent-login' } },
      }).as('requiresReauth');

      cy.get('input[type="tel"]').type(testPhoneNumber);
      cy.get('button').contains('Send Verification Code').click();

      // Enter wrong password
      cy.get('input[type="password"]').type('wrongpassword');
      cy.get('button').contains('Confirm').click();

      // Should show error message
      cy.get('.MuiAlert-message').should('contain', 'The password is invalid');
    });

    it('should allow canceling reauthentication', () => {
      // Mock the requires-recent-login error first
      cy.intercept('POST', '**/auth/phone/verify', {
        statusCode: 400,
        body: { error: { code: 'auth/requires-recent-login' } },
      }).as('requiresReauth');

      cy.get('input[type="tel"]').type(testPhoneNumber);
      cy.get('button').contains('Send Verification Code').click();

      // Cancel reauthentication
      cy.get('button').contains('Cancel').click();

      // Should return to MFA setup form
      cy.get('h3').should('contain', 'Set up Two-Factor Authentication');
      cy.get('input[type="tel"]').should('exist');
    });

    it('should handle MFA enrollment errors', () => {
      // Mock MFA enrollment error
      cy.intercept('POST', '**/auth/mfa/verify', {
        statusCode: 400,
        body: { error: { code: 'auth/invalid-verification-code' } },
      }).as('mfaError');

      cy.get('input[type="tel"]').type(testPhoneNumber);
      cy.get('button').contains('Send Verification Code').click();

      cy.get('input[id="verificationCode"]').type('000000'); // Wrong code
      cy.get('button').contains('Verify Code').click();

      // Should show error message
      cy.get('.MuiAlert-message').should('contain', 'Error finalizing 2FA setup');
    });

    it('should require email verification before MFA setup', () => {
      // Mock user with unverified email
      cy.window().then((win) => {
        if (win.store) {
          win.store.dispatch({
            type: 'user/setUserVerifiedEmail',
            payload: false,
          });
        }
      });

      cy.visit('/auth/login');
      cy.logInWithEmailAndPassword(superAdminEmail, superAdminPassword);

      // Should show email verification requirement
      cy.get('p').should('contain', 'Please verify your email before setting up 2FA');
      cy.get('button').contains('Send Verification Email').should('exist');
    });
  });

  describe('MFA Verification Flow (Login)', () => {
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
    });

    it('should handle MFA verification during login', () => {
      // Mock MFA required error during login
      cy.intercept('POST', '**/auth/login', {
        statusCode: 400,
        body: { error: { code: 'auth/multi-factor-auth-required' } },
      }).as('mfaRequired');

      cy.visit('/auth/login');
      cy.get('#email').type(superAdminEmail);
      cy.get('#password').type(superAdminPassword);
      cy.get('button[type="submit"]').click();

      // Trigger SMS
      cy.get('button').contains('Send SMS Code').click();

      // Enter verification code
      cy.get('input[id="verificationCode"]').type(testVerificationCode);
      cy.get('button').contains('Verify Code').click();

      // Should redirect to admin dashboard
      cy.url().should('include', '/admin/dashboard');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      cy.logInWithEmailAndPassword(superAdminEmail, superAdminPassword);
    });

    afterEach(() => {
      cy.logout();
    });

    it('should handle network errors gracefully', () => {
      // Mock network error
      cy.intercept('POST', '**/auth/phone/verify', {
        statusCode: 500,
        body: { error: 'Network error' },
      }).as('networkError');

      cy.get('input[type="tel"]').type(testPhoneNumber);
      cy.get('button').contains('Send Verification Code').click();

      // Should show generic error message
      cy.get('.MuiAlert-message').should('contain', 'Error enrolling in 2FA');
    });

    it('should handle too many requests error', () => {
      // Mock too many requests error during reauthentication
      cy.intercept('POST', '**/auth/phone/verify', {
        statusCode: 400,
        body: { error: { code: 'auth/requires-recent-login' } },
      }).as('requiresReauth');

      cy.get('input[type="tel"]').type(testPhoneNumber);
      cy.get('button').contains('Send Verification Code').click();

      // Mock too many requests during reauthentication
      cy.window().then((win) => {
        if (win.firebase && win.firebase.auth) {
          win.firebase.auth().currentUser.reauthenticateWithCredential = cy.stub().rejects({
            code: 'auth/too-many-requests',
          });
        }
      });

      cy.get('input[type="password"]').type('anypassword');
      cy.get('button').contains('Confirm').click();

      // Should show rate limiting error
      cy.get('.MuiAlert-message').should('contain', 'Too many failed login attempts');
    });

    it('should prevent multiple reCAPTCHA renderings', () => {
      // Spy on console errors to detect reCAPTCHA rendering issues
      cy.window().then((win) => {
        cy.spy(win.console, 'error').as('consoleError');
      });

      // Trigger MFA setup multiple times quickly
      cy.get('input[type="tel"]').type(testPhoneNumber);
      cy.get('button').contains('Send Verification Code').click();
      cy.get('button').contains('Send Verification Code').click();
      cy.get('button').contains('Send Verification Code').click();

      // Should not have reCAPTCHA already rendered errors
      cy.get('@consoleError').should(
        'not.have.been.calledWith',
        Cypress.sinon.match(/reCAPTCHA has already been rendered/),
      );
    });
  });

  describe('UI/UX Validation', () => {
    beforeEach(() => {
      cy.logInWithEmailAndPassword(superAdminEmail, superAdminPassword);
    });

    afterEach(() => {
      cy.logout();
    });

    it('should show loading states during operations', () => {
      cy.get('input[type="tel"]').type(testPhoneNumber);

      // Mock slow response to test loading state
      cy.intercept('POST', '**/auth/phone/verify', (req) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ statusCode: 200, body: { verificationId: 'mock-id' } });
          }, 1000);
        });
      }).as('slowSMS');

      cy.get('button').contains('Send Verification Code').click();

      // Button should be disabled during loading
      cy.get('button').contains('Send Verification Code').should('be.disabled');
    });

    it('should validate phone number format', () => {
      // Enter invalid phone number
      cy.get('input[type="tel"]').type('123');
      cy.get('button').contains('Send Verification Code').click();

      // Should show validation error (this depends on your phone validation)
      // Adjust based on your actual validation implementation
    });

    it('should validate verification code format', () => {
      cy.get('input[type="tel"]').type(testPhoneNumber);
      cy.get('button').contains('Send Verification Code').click();

      // Try to submit without entering code
      cy.get('button').contains('Verify Code').click();

      // Should require verification code
      cy.get('input[id="verificationCode"]').should('have.attr', 'required');
    });

    it('should clear errors when starting new operations', () => {
      // Trigger an error first
      cy.intercept('POST', '**/auth/phone/verify', {
        statusCode: 400,
        body: { error: { code: 'auth/invalid-phone-number' } },
      }).as('phoneError');

      cy.get('input[type="tel"]').type('invalid');
      cy.get('button').contains('Send Verification Code').click();

      // Should show error
      cy.get('.MuiAlert-message').should('exist');

      // Clear input and try again - error should be cleared
      cy.get('input[type="tel"]').clear().type(testPhoneNumber);

      // Mock successful response
      cy.intercept('POST', '**/auth/phone/verify', {
        statusCode: 200,
        body: { verificationId: 'mock-id' },
      }).as('successSMS');

      cy.get('button').contains('Send Verification Code').click();

      // Error should be cleared
      cy.get('.MuiAlert-message').should('not.exist');
    });
  });
});
