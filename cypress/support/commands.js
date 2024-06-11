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

import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const http = require('http');

Cypress.Commands.add('uiLogin', (email, password) => {
  cy.visit('/auth/login');
  cy.wait(4000);
  cy.get('input[type="email"]', { timeout: 10000 }).click().type(email);
  cy.get('#password').type(password);
  cy.get('button[type="submit"]').contains('Login').click();
  cy.get('#password', { timeout: 10000 }).should('not.exist');
});

Cypress.Commands.add('uiLogout', (e) => {
  cy.get('#user-menu-button').click({ force: true });
  cy.wait(1000);

  cy.get('#logout-button').click({ force: true });
  cy.wait(1000);
});

// TODO maybe delete  this helper - keeping for now but could potentially not be useful
Cypress.Commands.add('uiCreateAccessCode', () => {
  cy.get('input[type="radio"').should('exist').check('therapy'); //select radio button on form
  cy.get('button[type="submit"]').contains('Create access code').click(); // submit form to create access code
  cy.get('#access-code')
    .should('exist') //wait for result to exist in dom then get the access code
    .then(function ($elem) {
      //get the access code
      return $elem.text();
    });
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
    if (email && email.indexOf('cypress') >= 0) {
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

Cypress.Commands.add('createUser', ({ codeInput, emailInput, passwordInput, partnerId }) => {
  cy.request({
    url: `${Cypress.env('api_url')}/user`,
    method: 'POST',
    body: {
      partnerAccessCode: codeInput,
      name: 'Cypress test user',
      email: emailInput,
      password: passwordInput,
      contactPermission: true,
      signUpLanguage: 'en',
      partnerId: partnerId,
    },
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
  cy.wait(2000);
});

Cypress.Commands.add('deleteCypressAccessCodes', () => {
  cy.getAccessToken().then((token) => {
    cy.request({
      url: `${Cypress.env('api_url')}/partner-access/cypress`,
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
  });
  cy.wait(2000);
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

Cypress.Commands.add('visitGermanPage', (url) => {
  cy.visit(url, {
    onBeforeLoad(win) {
      Object.defineProperty(win.navigator, 'language', { value: 'de-DE' });
      Object.defineProperty(win.navigator, 'languages', { value: ['de'] });
      Object.defineProperty(win.navigator, 'accept_languages', { value: ['de'] });
    },
    headers: {
      'Accept-Language': 'de',
    },
  });
});

Cypress.Commands.add('visitSpanishPage', (url) => {
  cy.visit(url, {
    onBeforeLoad(win) {
      Object.defineProperty(win.navigator, 'language', { value: 'es-ES' });
      Object.defineProperty(win.navigator, 'languages', { value: ['es'] });
      Object.defineProperty(win.navigator, 'accept_languages', { value: ['es'] });
    },
    headers: {
      'Accept-Language': 'es',
    },
  });
});

Cypress.Commands.add('visitHindiPage', (url) => {
  cy.visit(url, {
    onBeforeLoad(win) {
      Object.defineProperty(win.navigator, 'language', { value: 'hi-IN' });
      Object.defineProperty(win.navigator, 'languages', { value: ['hi'] });
      Object.defineProperty(win.navigator, 'accept_languages', { value: ['hi'] });
    },
    headers: {
      'Accept-Language': 'hi',
    },
  });
});

Cypress.Commands.add('visitFrenchPage', (url) => {
  cy.visit(url, {
    onBeforeLoad(win) {
      Object.defineProperty(win.navigator, 'language', { value: 'fr-FR' });
      Object.defineProperty(win.navigator, 'languages', { value: ['fr'] });
      Object.defineProperty(win.navigator, 'accept_languages', { value: ['fr'] });
    },
    headers: {
      'Accept-Language': 'fr',
    },
  });
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

const app = initializeApp(fbConfig);
const auth = getAuth(app);

const attachCustomCommands = (Cypress, auth) => {
  let currentUser = null;
  let token = null;
  onAuthStateChanged(auth, async (user) => {
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
    return signInWithEmailAndPassword(auth, emailInput, passwordInput);
  });
  Cypress.Commands.add('logout', () => {
    return signOut(auth);
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

  //Function to grab iframe needs some work. At the moment it can't see the inner content.
  //This will help with test to watch session videos
  Cypress.Commands.add('getIframeBody', () => {
    return (
      cy
        .get('iframe')
        .its('0.contentDocument')
        .should('exist')
        // automatically retries until body is loaded
        .its('body')
        .should('not.be.undefined')
        .then(cy.wrap)
    );
  });
};

attachCustomCommands(Cypress, auth);
