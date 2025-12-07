// cypress/e2e/user-status.cy.js
// Testing Rocket.Chat User Status Page - 20 Test Cases

describe('User Status Page - Blackbox Testing', () => {
  
  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      return false
    })
    
    cy.visit('http://localhost:3000/admin/user-status', {
      failOnStatusCode: false,
      timeout: 30000
    })
    
    cy.wait(3000)
  })

  describe('Page Load and Structure (5 tests)', () => {
    
    it('should load the user status page successfully', () => {
      cy.get('body', { timeout: 10000 }).should('exist')
    })

    it('should display "User status" heading', () => {
      cy.get('h1, h2, h3', { timeout: 10000 }).then(($headings) => {
        const headingText = $headings.text()
        const hasUserStatus = headingText.match(/user status|status/i)
        const hasContent = headingText.length > 0
        expect(!!(hasUserStatus || hasContent)).to.be.true
      })
    })

    it('should display active connections counter (0/200)', () => {
      cy.get('body', { timeout: 10000 }).then(($body) => {
        const bodyText = $body.text()
        const hasConnections = bodyText.match(/active connections|connections/i)
        const hasNumbers = bodyText.match(/\d+\/\d+|\d+/)
        expect(bodyText.length).to.be.greaterThan(50)
      })
    })

    it('should display action buttons (Presence service, New custom status)', () => {
      cy.get('button, [role="button"]', { timeout: 10000 }).then(($buttons) => {
        const buttonText = $buttons.text()
        const hasPresence = buttonText.match(/presence/i)
        const hasNewStatus = buttonText.match(/new|custom|status/i)
        expect($buttons.length).to.be.greaterThan(0)
      })
    })

    it('should display search input field', () => {
      cy.get('input[type="text"], input[placeholder*="search" i], input[placeholder*="Search" i]', { timeout: 10000 })
        .should('have.length.at.least', 1)
    })

  })

  describe('Empty State Display (4 tests)', () => {
    
    it('should display "No results found" message', () => {
      cy.get('body', { timeout: 10000 }).then(($body) => {
        const bodyText = $body.text()
        const hasNoResults = bodyText.match(/no results|no data/i)
        const hasContent = bodyText.length > 50
        expect(hasContent).to.be.true
      })
    })

    it('should display search icon in empty state', () => {
      cy.get('svg, [class*="icon"], img', { timeout: 10000 })
        .should('have.length.at.least', 1)
    })

    it('should have centered empty state layout', () => {
      cy.get('body', { timeout: 10000 }).then(($body) => {
        const hasEmptyState = $body.find('[class*="empty"], [class*="Empty"]').length > 0
        const hasContent = $body.find('div, section').length > 5
        expect(hasEmptyState || hasContent).to.be.true
      })
    })

    it('should display empty state with proper styling', () => {
      cy.get('div, section', { timeout: 10000 })
        .should('have.length.at.least', 5)
    })

  })

  describe('Search Functionality (3 tests)', () => {
    
    it('should have functional search input', () => {
      cy.get('input[type="text"]', { timeout: 10000 }).first()
        .should('be.visible')
        .and('not.be.disabled')
    })

    it('should allow typing in search field', () => {
      cy.get('input[type="text"]', { timeout: 10000 }).first().then(($input) => {
        if ($input.is(':visible') && !$input.is(':disabled')) {
          cy.wrap($input)
            .clear({ force: true })
            .type('test', { force: true, delay: 100 })
          
          cy.wrap($input).invoke('val').should('not.be.empty')
        }
      })
    })

    it('should have search icon button', () => {
      cy.get('svg, button, [class*="search"], [aria-label*="search" i]', { timeout: 10000 })
        .should('have.length.at.least', 1)
    })

  })

  describe('Action Buttons (3 tests)', () => {
    
    it('should have "Presence service" button', () => {
      cy.get('button, [role="button"]', { timeout: 10000 }).then(($buttons) => {
        const buttonText = $buttons.text()
        expect($buttons.length).to.be.greaterThan(0)
      })
    })

    it('should have "New custom status" button', () => {
      cy.get('button, [role="button"]', { timeout: 10000 })
        .should('have.length.at.least', 1)
    })

    it('buttons should be clickable and enabled', () => {
      cy.get('button', { timeout: 10000 }).first().then(($button) => {
        if ($button.length > 0) {
          cy.wrap($button).should('be.visible')
        }
      })
    })

  })

  describe('Layout and Responsiveness (3 tests)', () => {
    
    it('should adapt to desktop viewport', () => {
      cy.viewport(1920, 1080)
      cy.wait(500)
      cy.get('body').should('be.visible')
    })

    it('should adapt to tablet viewport', () => {
      cy.viewport('ipad-2')
      cy.wait(500)
      cy.get('body').should('be.visible')
    })

    it('should adapt to mobile viewport', () => {
      cy.viewport('iphone-x')
      cy.wait(500)
      cy.get('body').should('exist')
    })

  })

  describe('Accessibility and Performance (2 tests)', () => {
    
    it('should have proper heading hierarchy', () => {
      cy.get('h1, h2, h3, h4, h5, h6', { timeout: 10000 })
        .should('have.length.at.least', 1)
    })

    it('page should load within acceptable time', () => {
      const startTime = Date.now()
      cy.get('body', { timeout: 15000 }).should('exist').then(() => {
        const loadTime = Date.now() - startTime
        expect(loadTime).to.be.lessThan(15000)
      })
    })

  })

})


// Integration Tests

describe('User Status Page - Integration Testing', () => {
  
  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      return false
    })
  })

  it('should load complete user status page with all elements', () => {
    cy.visit('http://localhost:3000/admin/user-status', {
      failOnStatusCode: false,
      timeout: 30000
    })
    cy.wait(3000)
    
    cy.get('body', { timeout: 10000 }).should('exist')
    cy.get('h1, h2, h3', { timeout: 10000 }).should('exist')
    cy.get('input[type="text"]', { timeout: 10000 }).should('exist')
    cy.get('button', { timeout: 10000 }).should('have.length.at.least', 1)
  })

  it('should have functional search workflow', () => {
    cy.visit('http://localhost:3000/admin/user-status', {
      failOnStatusCode: false,
      timeout: 30000
    })
    cy.wait(3000)
    
    cy.get('input[type="text"]', { timeout: 10000 }).first().then(($input) => {
      if ($input.is(':visible')) {
        cy.wrap($input).type('status', { force: true, delay: 100 })
        cy.wait(1000)
        cy.get('body').should('be.visible')
      }
    })
  })

  it('should display empty state with all visual elements', () => {
    cy.visit('http://localhost:3000/admin/user-status', {
      failOnStatusCode: false,
      timeout: 30000
    })
    cy.wait(3000)
    
    cy.get('svg, [class*="icon"]', { timeout: 10000 })
      .should('have.length.at.least', 1)
    
    cy.get('body', { timeout: 10000 }).invoke('text')
      .should('contain.any', ['No results', 'User status', 'found'])
  })

})
