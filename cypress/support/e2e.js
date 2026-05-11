// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Next.js throws frozen error objects that Cypress can't serialize — suppress them.
Cypress.on('uncaughtException', (err) => {
  if (err.message.includes('ERR_PREPARED_FOR_SERIALIZATION')) {
    return false;
  }
});

// Alternatively you can use CommonJS syntax:
// require('./commands')
