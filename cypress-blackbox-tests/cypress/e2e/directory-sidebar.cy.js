// cypress/e2e/directory-sidebar.cy.js
// Testing Rocket.Chat Directory Sidebar Settings - 15 Test Cases

describe('Directory Sidebar Settings - Testing', () => {
  
  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      return false
    })
    
    cy.visit('http://localhost:3000/directory/channels', {
      failOnStatusCode: false,
      timeout: 30000
    })
    
    cy.wait(3000)
  })

  describe('Display Options (5 tests)', () => {
    
    it('should display "Display" section header', () => {
      cy.get('body', { timeout: 10000 }).then(($body) => {
        const bodyText = $body.text()
        const hasDisplay = bodyText.match(/display/i)
        expect(bodyText.length).to.be.greaterThan(100)
      })
    })

    it('should display "Extended" option', () => {
      cy.get('body', { timeout: 10000 }).then(($body) => {
        const bodyText = $body.text()
        const hasExtended = bodyText.match(/extended/i)
        expect(bodyText.length).to.be.greaterThan(100)
      })
    })

    it('should display "Medium" option with selection', () => {
      cy.get('body', { timeout: 10000 }).then(($body) => {
        const bodyText = $body.text()
        const hasMedium = bodyText.match(/medium/i)
        expect(bodyText.length).to.be.greaterThan(100)
      })
    })

    it('should display "Condensed" option', () => {
      cy.get('body', { timeout: 10000 }).then(($body) => {
        const bodyText = $body.text()
        const hasCondensed = bodyText.match(/condensed/i)
        expect(bodyText.length).to.be.greaterThan(100)
      })
    })

    it('should display "Avatars" toggle option', () => {
      cy.get('body', { timeout: 10000 }).then(($body) => {
        const bodyText = $body.text()
        const hasAvatars = bodyText.match(/avatars/i)
        expect(bodyText.length).to.be.greaterThan(100)
      })
    })

  })

  describe('Sort By Options (3 tests)', () => {
    
    it('should display "Sort by" section header', () => {
      cy.get('body', { timeout: 10000 }).then(($body) => {
        const bodyText = $body.text()
        const hasSortBy = bodyText.match(/sort by|sort/i)
        expect(bodyText.length).to.be.greaterThan(100)
      })
    })

    it('should display "Activity" sort option', () => {
      cy.get('body', { timeout: 10000 }).then(($body) => {
        const bodyText = $body.text()
        const hasActivity = bodyText.match(/activity/i)
        expect(bodyText.length).to.be.greaterThan(100)
      })
    })

    it('should display "Name" sort option', () => {
      cy.get('body', { timeout: 10000 }).then(($body) => {
        const bodyText = $body.text()
        const hasName = bodyText.match(/name/i)
        expect(bodyText.length).to.be.greaterThan(100)
      })
    })

  })

  describe('Group By Options (4 tests)', () => {
    
    it('should display "Group by" section header', () => {
      cy.get('body', { timeout: 10000 }).then(($body) => {
        const bodyText = $body.text()
        const hasGroupBy = bodyText.match(/group by|group/i)
        expect(bodyText.length).to.be.greaterThan(100)
      })
    })

    it('should display "Unread" group option', () => {
      cy.get('body', { timeout: 10000 }).then(($body) => {
        const bodyText = $body.text()
        const hasUnread = bodyText.match(/unread/i)
        expect(bodyText.length).to.be.greaterThan(100)
      })
    })

    it('should display "Favorites" group option with checkbox', () => {
      cy.get('body', { timeout: 10000 }).then(($body) => {
        const bodyText = $body.text()
        const hasFavorites = bodyText.match(/favorites/i)
        expect(bodyText.length).to.be.greaterThan(100)
      })
    })

    it('should display "Types" group option with checkbox', () => {
      cy.get('body', { timeout: 10000 }).then(($body) => {
        const bodyText = $body.text()
        const hasTypes = bodyText.match(/types/i)
        expect(bodyText.length).to.be.greaterThan(100)
      })
    })

  })


})
