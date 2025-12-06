// ***********************************************
// Custom Commands for Rocket.Chat Testing
// ***********************************************

// Login command - FIXED for Rocket.Chat UI
Cypress.Commands.add('login', (username = 'admin', password = 'admin') => {
  cy.visit('/login')
  cy.wait(3000)  // Wait for page to load
  
  // Try multiple possible selectors
  cy.get('body').then(($body) => {
    // Check if already logged in
    if ($body.text().includes('Home') || $body.find('[data-qa="sidebar"]').length > 0) {
      cy.log('✅ Already logged in')
      return
    }
    
    // Find username field
    cy.get('input[name="emailOrUsername"], input[name="username"], input[type="text"]').first().type(username)
    
    // Find password field
    cy.get('input[name="pass"], input[name="password"], input[type="password"]').first().type(password)
    
    // Find login button
    cy.get('button[type="submit"], button').contains(/login|submit/i).click()
    
    // Wait for redirect
    cy.wait(5000)
  })
})

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('[data-qa="sidebar-avatar-button"], [data-qa="user-avatar"]').click()
  cy.contains('Logout').click()
})

// Send message command
Cypress.Commands.add('sendMessage', (message) => {
  cy.get('.rc-message-box__textarea, textarea[name="msg"]').type(`${message}{enter}`)
  cy.wait(1000)
})
