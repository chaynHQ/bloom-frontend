// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
const http = require('http');

Cypress.Commands.add('uiLogin', (email, password) => {
  cy.visit('/auth/login');
  cy.wait(2000);
  cy.get('input[type="email"]', { timeout: 2000 }).click().type(email);
  cy.get('#password').type(password);
  cy.get('button[type="submit"]').contains('Login').click();
  cy.wait(1000);
  cy.get('#password').should('not.exist');
});

Cypress.Commands.add('uiLogout', (e) => {
  cy.get('#user-menu-button').click({ force: true });
  cy.wait(1000);

  cy.get('#logout-button').click({ force: true });
  cy.wait(1000);
});

// TODO maybe delete  this helper - keeping for now but could potentially not be useful
Cypress.Commands.add('uiCreateAccessCode', () => {
  cy.visit('/partner-admin/create-access-code');
  cy.wait(1000);
  cy.get('span').contains('Courses, 1:1 chat and six therapy sessions').click();
  cy.get('button[type="submit"]').contains('Create access code').click();
  cy.wait(1000);
  return cy.get('#access-code-url').invoke('attr', 'href');
});

Cypress.Commands.add('createAccessCode', (accessCode) => {
  cy.getAccessToken().then((token) => {
    return cy.request({
      url: `${Cypress.env('api_url')}/partner-access`,
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: accessCode,
    });
  });
});

Cypress.Commands.add('deleteUser', () => {
  cy.getAuthEmail().then((email) => {
    if (email && email.indexOf('cypress') > 0) {
      cy.getAccessToken().then((token) => {
        cy.request({
          url: `${Cypress.env('api_url')}/user`,
          method: 'DELETE',
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
      });
    }
  });
});

Cypress.Commands.add('deleteAllCypressUsers', () => {
  cy.getAccessToken().then((token) => {
    cy.request({
      url: `${Cypress.env('api_url')}/user/cypress`,
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
  });
});

Cypress.Commands.add('cleanUpTestState', () => {
  cy.visit('/');
  cy.getAuthEmail().then((email) => {
    if (email) {
      cy.logout();
    }
  });
  cy.clearUserState();
  cy.clearAllCookies();
  cy.clearAllLocalStorage();
  cy.clearAllSessionStorage();
  cy.wait(1000);
});

// CUSTOM COMMANDS THAT NEED FIREBASE ACCESS
const fbConfig = {
  apiKey: Cypress.env('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: Cypress.env('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: Cypress.env('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: Cypress.env('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: Cypress.env('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: Cypress.env('NEXT_PUBLIC_FIREBASE_APP_ID'),
  measurementId: Cypress.env('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'),
};

firebase.initializeApp(fbConfig);

const attachCustomCommands = (Cypress, { auth }) => {
  let currentUser = null;
  let token = null;
  auth().onAuthStateChanged((user) => {
    currentUser = user;
    token = currentUser
      ? currentUser.getIdToken().then((t) => {
          token = t;
        })
      : null;
  });

  Cypress.Commands.add('getAccessToken', () => {
    return token ? cy.wrap(token) : undefined;
  });
  Cypress.Commands.add('logInWithEmailAndPassword', (emailInput, passwordInput) => {
    return auth().signInWithEmailAndPassword(emailInput, passwordInput);
  });
  Cypress.Commands.add('logout', () => {
    return auth().signOut();
  });
  Cypress.Commands.add('getAuthEmail', () => {
    return currentUser ? cy.wrap(currentUser.email) : undefined;
  });
  Cypress.Commands.add('clearUserState', () => {
    cy.window().then((win) => {
      // @ts-ignore
      if (win.store) {
        // @ts-ignore
        const result = win.store.dispatch({ type: 'user/clearUserSlice' });
      }
    });
  });
};

attachCustomCommands(Cypress, firebase);
