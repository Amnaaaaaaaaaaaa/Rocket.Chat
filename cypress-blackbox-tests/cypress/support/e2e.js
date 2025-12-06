// ***********************************************************
// This file is processed and loaded automatically before test files.
// ***********************************************************

import './commands'

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false
})

beforeEach(() => {
  cy.clearCookies()
  cy.clearLocalStorage()
})
