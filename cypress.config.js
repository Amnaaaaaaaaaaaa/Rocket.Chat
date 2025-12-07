const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.cy.{js,ts,jsx,tsx}',
    baseUrl: 'http://localhost:3000', // change if needed
    supportFile: false // or 'cypress/support/e2e.js' if you have support file
  },
});
