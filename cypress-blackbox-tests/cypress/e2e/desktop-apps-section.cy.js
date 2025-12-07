// cypress/e2e/desktop-apps-section.cy.js
// Testing Rocket.Chat Download Apps Page

describe('Desktop Apps Section - Blackbox Testing', () => {
  
  beforeEach(() => {
    // Uncaught exceptions ko ignore karo (external website ki scripts ke liye)
    cy.on('uncaught:exception', (err, runnable) => {
      // Cross-origin script errors ko ignore karo
      return false
    })
    
    // Official Rocket.Chat download page
    cy.visit('https://www.rocket.chat/download-apps', {
      failOnStatusCode: false,
      timeout: 30000
    })
    
    // Page load hone ka wait karo
    cy.wait(3000)
  })

  describe('Visual Elements Testing', () => {
    
    it('should display the "Desktop apps" heading', () => {
      cy.contains('Desktop apps', { timeout: 15000 }).should('exist')
    })

    it('should display the installation instruction text', () => {
      cy.contains('Communicate securely from your desktop', { timeout: 15000 })
        .should('be.visible')
    })

    it('should display platform download buttons/links', () => {
      // Mac App Store link
      cy.get('a[href*="apps.apple.com"]', { timeout: 15000 }).first().should('be.visible')
      // Linux Snap Store link  
      cy.get('a[href*="snapcraft.io"]', { timeout: 15000 }).should('be.visible')
      // Windows/General download link
      cy.get('a[href*="releases.rocket.chat"]', { timeout: 15000 }).should('be.visible')
    })

  })

  describe('Download Links Testing', () => {
    
    it('Mac App Store link should be present and have correct href', () => {
      cy.get('a[href*="apps.apple.com"]', { timeout: 15000 }).first()
        .should('have.attr', 'href')
        .and('include', 'rocket-chat')
    })

    it('Linux Snap Store link should be present and have correct href', () => {
      cy.get('a[href*="snapcraft.io"]', { timeout: 15000 })
        .should('have.attr', 'href')
        .and('include', 'rocketchat-desktop')
    })

    it('Windows download link should be present and have correct href', () => {
      cy.get('a[href*="releases.rocket.chat"]', { timeout: 15000 })
        .should('have.attr', 'href')
        .and('include', 'download')
    })

    it('All download links should be clickable', () => {
      cy.get('a[href*="apps.apple.com"]', { timeout: 15000 }).first()
        .should('exist')
        .and('not.be.disabled')
      
      cy.get('a[href*="snapcraft.io"]', { timeout: 15000 })
        .should('exist')
        .and('not.be.disabled')
      
      cy.get('a[href*="releases.rocket.chat"]', { timeout: 15000 })
        .should('exist')
        .and('not.be.disabled')
    })

  })

  describe('Mobile Apps Section Testing', () => {
    
    it('should display "Mobile apps" heading', () => {
      cy.contains('Mobile apps', { timeout: 15000 }).should('be.visible')
    })

    it('should display mobile app instruction text', () => {
      cy.contains('Communicate securely on the go', { timeout: 15000 })
        .should('be.visible')
    })

    it('should have iOS App Store link', () => {
      cy.get('a[href*="apps.apple.com"]', { timeout: 15000 }).eq(1)
        .should('have.attr', 'href')
        .and('include', 'rocket-chat')
    })

    it('should have Google Play Store link', () => {
      cy.get('a[href*="play.google.com"]', { timeout: 15000 })
        .should('have.attr', 'href')
        .and('include', 'rocket.android')
    })

  })

  describe('Page Content Validation', () => {
    
    it('should display main page heading', () => {
      cy.contains('Rocket.Chat apps for all your devices', { timeout: 15000 })
        .should('be.visible')
    })

    it('should display workspace URL requirement warning', () => {
      cy.contains('A workspace URL is required', { timeout: 15000 })
        .should('be.visible')
    })

    it('should have proper page structure with both sections', () => {
      // Desktop section
      cy.contains('Desktop apps', { timeout: 15000 }).should('exist')
      // Mobile section
      cy.contains('Mobile apps', { timeout: 15000 }).should('exist')
    })

  })

  describe('Layout and Responsiveness Testing', () => {
    
    it('should display properly on desktop viewport (1920x1080)', () => {
      cy.viewport(1920, 1080)
      cy.wait(1000)
      cy.contains('Desktop apps', { timeout: 15000 }).should('exist')
      cy.get('a[href*="apps.apple.com"]', { timeout: 15000 }).first().should('be.visible')
    })

    it('should display properly on tablet viewport (iPad)', () => {
      cy.viewport('ipad-2')
      cy.wait(1000)
      cy.contains('Desktop apps', { timeout: 15000 }).should('exist')
      cy.get('a[href*="snapcraft.io"]', { timeout: 15000 }).should('be.visible')
    })

    it('should display properly on mobile viewport (iPhone)', () => {
      cy.viewport('iphone-x')
      cy.wait(1000)
      cy.contains('Desktop apps', { timeout: 15000 }).should('exist')
    })

  })

  describe('Accessibility Testing', () => {
    
    it('should have proper heading hierarchy', () => {
      cy.get('h1, h2, h3', { timeout: 15000 }).should('exist')
    })

    it('download links should have valid href attributes', () => {
      cy.get('a[href*="apps.apple.com"]', { timeout: 15000 }).first()
        .should('have.attr', 'href')
        .and('match', /^https:\/\//)
    })

    it('links should have images for visual identification', () => {
      cy.get('a[href*="apps.apple.com"]', { timeout: 15000 }).first()
        .should('exist')
        .within(() => {
          cy.get('img', { timeout: 10000 }).should('exist')
        })
    })

  })

  describe('Performance Testing', () => {
    
    it('page should load main content within acceptable time', () => {
      const startTime = Date.now()
      cy.contains('Desktop apps', { timeout: 15000 }).should('exist').then(() => {
        const loadTime = Date.now() - startTime
        expect(loadTime).to.be.lessThan(15000) // 15 seconds se kam
      })
    })

  })

  describe('Edge Cases Testing', () => {
    
    it('should handle page refresh correctly', () => {
      cy.reload()
      cy.wait(3000)
      cy.contains('Desktop apps', { timeout: 15000 }).should('exist')
    })

    it('should maintain content after scrolling', () => {
      cy.scrollTo('bottom')
      cy.wait(1000)
      cy.scrollTo('top')
      cy.contains('Desktop apps', { timeout: 15000 }).should('exist')
    })

  })

})


// Integration tests for complete user flow

describe('Desktop Apps Page - Integration Testing', () => {
  
  beforeEach(() => {
    // Uncaught exceptions ko ignore karo
    cy.on('uncaught:exception', (err, runnable) => {
      return false
    })
  })

  it('should complete full page navigation flow', () => {
    cy.visit('https://www.rocket.chat/download-apps', {
      failOnStatusCode: false,
      timeout: 30000
    })
    cy.wait(3000)
    
    cy.contains('Desktop apps', { timeout: 15000 }).should('exist')
    cy.contains('Mobile apps', { timeout: 15000 }).should('be.visible')
    
    // Verify all download sections exist
    cy.get('a[href*="apps.apple.com"]', { timeout: 15000 }).should('have.length.at.least', 2)
    cy.get('a[href*="snapcraft.io"]', { timeout: 15000 }).should('exist')
    cy.get('a[href*="releases.rocket.chat"]', { timeout: 15000 }).should('exist')
    cy.get('a[href*="play.google.com"]', { timeout: 15000 }).should('exist')
  })

  it('should allow user to view all platform options', () => {
    cy.visit('https://www.rocket.chat/download-apps', {
      failOnStatusCode: false,
      timeout: 30000
    })
    cy.wait(3000)
    
    // Desktop platforms
    cy.contains('Desktop apps', { timeout: 15000 }).should('exist')
    cy.get('a[href*="apps.apple.com"]', { timeout: 15000 }).first().should('exist')
    cy.get('a[href*="snapcraft.io"]', { timeout: 15000 }).should('exist')
    cy.get('a[href*="releases.rocket.chat"]', { timeout: 15000 }).should('exist')
    
    // Mobile platforms - scroll into view
    cy.contains('Mobile apps', { timeout: 15000 }).scrollIntoView()
    cy.wait(1000)
    cy.get('a[href*="play.google.com"]', { timeout: 15000 }).should('be.visible')
  })

  it('should display page title and branding correctly', () => {
    cy.visit('https://www.rocket.chat/download-apps', {
      failOnStatusCode: false,
      timeout: 30000
    })
    cy.wait(3000)
    
    // Check main heading
    cy.contains('Rocket.Chat apps for all your devices', { timeout: 15000 })
      .should('be.visible')
    
    // Check for logo or branding elements
    cy.get('img', { timeout: 15000 }).should('exist')
  })

})


// Additional test suite for download functionality

describe('Download Links Functionality', () => {

  beforeEach(() => {
    // Uncaught exceptions ko ignore karo
    cy.on('uncaught:exception', (err, runnable) => {
      return false
    })
    
    cy.visit('https://www.rocket.chat/download-apps', {
      failOnStatusCode: false,
      timeout: 30000
    })
    cy.wait(3000)
  })

  it('should have valid HTTPS download links', () => {
    // Mac App Store
    cy.get('a[href*="apps.apple.com"]', { timeout: 15000 }).first()
      .should('have.attr', 'href')
      .and('match', /^https:\/\//)
    
    // Snap Store
    cy.get('a[href*="snapcraft.io"]', { timeout: 15000 })
      .should('have.attr', 'href')
      .and('match', /^https:\/\//)
    
    // Releases
    cy.get('a[href*="releases.rocket.chat"]', { timeout: 15000 })
      .should('have.attr', 'href')
      .and('match', /^https:\/\//)
  })

  it('should display download platform images correctly', () => {
    cy.get('a[href*="apps.apple.com"]', { timeout: 15000 }).first().within(() => {
      cy.get('img', { timeout: 10000 }).should('exist').and('be.visible')
    })
    
    cy.get('a[href*="snapcraft.io"]', { timeout: 15000 }).within(() => {
      cy.get('img', { timeout: 10000 }).should('exist').and('be.visible')
    })
    
    cy.get('a[href*="releases.rocket.chat"]', { timeout: 15000 }).within(() => {
      cy.get('img', { timeout: 10000 }).should('exist').and('be.visible')
    })
  })

  it('should have separate desktop and mobile download sections', () => {
    // Desktop section check
    cy.contains('Desktop apps', { timeout: 15000 }).should('exist')
    
    // Mobile section check
    cy.contains('Mobile apps', { timeout: 15000 }).scrollIntoView().should('be.visible')
  })

})
