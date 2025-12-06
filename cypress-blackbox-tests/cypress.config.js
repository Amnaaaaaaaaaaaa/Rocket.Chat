const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  
  env: {
    adminUsername: 'admin',
    adminPassword: 'admin',
    testUser: 'testuser',
    testPassword: 'test123'
  }
})
