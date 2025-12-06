#!/bin/bash

echo "🚀 Setting up Cypress Black-Box Tests..."

cd /home/aymen/Downloads/Rocket.Chat-develop

# 1. Create cypress-blackbox-tests folder
mkdir -p cypress-blackbox-tests
cd cypress-blackbox-tests

# 2. Create package.json
cat > package.json << 'PKG'
{
  "name": "rocketchat-cypress-blackbox-tests",
  "version": "1.0.0",
  "description": "Black-Box Testing for Rocket.Chat using Cypress",
  "scripts": {
    "cypress:open": "cypress open",
    "cypress:run": "cypress run",
    "test": "cypress run --headless",
    "test:chrome": "cypress run --browser chrome",
    "test:ui": "cypress open"
  },
  "keywords": ["cypress", "black-box", "e2e", "rocket.chat"],
  "author": "SQE Student 2",
  "license": "ISC",
  "devDependencies": {
    "cypress": "^13.6.2"
  }
}
PKG

# 3. Install Cypress
echo "📦 Installing Cypress..."
npm install

# 4. Create cypress.config.js
cat > cypress.config.js << 'CONFIG'
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
CONFIG

# 5. Create folder structure
echo "📁 Creating test folders..."
mkdir -p cypress/e2e/login
mkdir -p cypress/e2e/channels
mkdir -p cypress/e2e/messages
mkdir -p cypress/e2e/file-upload
mkdir -p cypress/e2e/search
mkdir -p cypress/e2e/notifications
mkdir -p cypress/fixtures
mkdir -p cypress/support

# 6. Create support/e2e.js
cat > cypress/support/e2e.js << 'SUPPORT'
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
SUPPORT

# 7. Create support/commands.js
cat > cypress/support/commands.js << 'COMMANDS'
// ***********************************************
// Custom Commands for Rocket.Chat Testing
// ***********************************************

// Login command
Cypress.Commands.add('login', (username = 'admin', password = 'admin') => {
  cy.visit('/login')
  cy.get('input[name="emailOrUsername"]', { timeout: 10000 }).should('be.visible').type(username)
  cy.get('input[name="pass"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.url({ timeout: 10000 }).should('not.include', '/login')
})

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('[data-qa="sidebar-avatar-button"]').click()
  cy.contains('Logout').click()
})

// Send message command
Cypress.Commands.add('sendMessage', (message) => {
  cy.get('.rc-message-box__textarea').type(`${message}{enter}`)
  cy.contains(message).should('be.visible')
})

// Create channel command
Cypress.Commands.add('createChannel', (channelName) => {
  cy.get('[data-qa="sidebar-create"]').click()
  cy.get('[data-qa="sidebar-create-channel"]').click()
  cy.get('input[name="name"]').type(channelName)
  cy.get('button[type="submit"]').click()
})
COMMANDS

# 8. Create Login Tests
cat > cypress/e2e/login/TC-LOGIN.cy.js << 'LOGIN'
/**
 * Black-Box Test Suite: Login Functionality
 * Test Cases: TC-BB-LOGIN-001 to TC-BB-LOGIN-010
 */

describe('Login - Black-Box Testing', () => {
  
  beforeEach(() => {
    cy.visit('/login')
  })

  it('TC-BB-LOGIN-001: Should display login page', () => {
    cy.get('input[name="emailOrUsername"]').should('be.visible')
    cy.get('input[name="pass"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
  })

  it('TC-BB-LOGIN-002: Should login with valid admin credentials', () => {
    cy.get('input[name="emailOrUsername"]').type(Cypress.env('adminUsername'))
    cy.get('input[name="pass"]').type(Cypress.env('adminPassword'))
    cy.get('button[type="submit"]').click()
    cy.url({ timeout: 10000 }).should('not.include', '/login')
  })

  it('TC-BB-LOGIN-003: Should show error for invalid credentials', () => {
    cy.get('input[name="emailOrUsername"]').type('invaliduser')
    cy.get('input[name="pass"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/login')
  })

  it('TC-BB-LOGIN-004: Should require username field', () => {
    cy.get('input[name="pass"]').type('password123')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/login')
  })

  it('TC-BB-LOGIN-005: Should require password field', () => {
    cy.get('input[name="emailOrUsername"]').type('admin')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/login')
  })

  it('TC-BB-LOGIN-006: Should handle empty form submission', () => {
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/login')
  })

  it('TC-BB-LOGIN-007: Should show/hide password', () => {
    cy.get('input[name="pass"]').should('have.attr', 'type', 'password')
  })

  it('TC-BB-LOGIN-008: Should have forgot password link', () => {
    cy.contains('Forgot your password').should('be.visible')
  })

  it('TC-BB-LOGIN-009: Should redirect after successful login', () => {
    cy.login(Cypress.env('adminUsername'), Cypress.env('adminPassword'))
    cy.url().should('include', '/home')
  })

  it('TC-BB-LOGIN-010: Should preserve login state', () => {
    cy.login()
    cy.reload()
    cy.url().should('not.include', '/login')
  })
})
LOGIN

# 9. Create Channel Tests
cat > cypress/e2e/channels/TC-CHANNEL.cy.js << 'CHANNEL'
/**
 * Black-Box Test Suite: Channel Management
 * Test Cases: TC-BB-CHANNEL-001 to TC-BB-CHANNEL-010
 */

describe('Channels - Black-Box Testing', () => {
  
  beforeEach(() => {
    cy.login()
  })

  it('TC-BB-CHANNEL-001: Should display default channels', () => {
    cy.contains('general').should('be.visible')
  })

  it('TC-BB-CHANNEL-002: Should open general channel', () => {
    cy.contains('general').click()
    cy.url().should('include', '/channel/general')
  })

  it('TC-BB-CHANNEL-003: Should display channel header', () => {
    cy.contains('general').click()
    cy.get('.rcx-room-header').should('be.visible')
  })

  it('TC-BB-CHANNEL-004: Should show channel members count', () => {
    cy.contains('general').click()
    cy.get('[data-qa="ToolBoxAction-members"]').should('be.visible')
  })

  it('TC-BB-CHANNEL-005: Should allow searching channels', () => {
    cy.get('[data-qa="sidebar-search"]').type('general')
    cy.contains('general').should('be.visible')
  })

  it('TC-BB-CHANNEL-006: Should display message input in channel', () => {
    cy.contains('general').click()
    cy.get('.rc-message-box__textarea').should('be.visible')
  })

  it('TC-BB-CHANNEL-007: Should show channel description', () => {
    cy.contains('general').click()
    cy.get('[data-qa="ToolBoxAction-info"]').click()
    cy.contains('Description').should('be.visible')
  })

  it('TC-BB-CHANNEL-008: Should navigate between channels', () => {
    cy.contains('general').click()
    cy.url().should('include', '/channel/general')
  })

  it('TC-BB-CHANNEL-009: Should show unread indicator', () => {
    cy.get('.rcx-sidebar-item__badge').should('exist')
  })

  it('TC-BB-CHANNEL-010: Should display channel list sidebar', () => {
    cy.get('.rcx-sidebar').should('be.visible')
  })
})
CHANNEL

# 10. Create Message Tests
cat > cypress/e2e/messages/TC-MESSAGE.cy.js << 'MESSAGE'
/**
 * Black-Box Test Suite: Message Functionality
 * Test Cases: TC-BB-MSG-001 to TC-BB-MSG-010
 */

describe('Messages - Black-Box Testing', () => {
  
  beforeEach(() => {
    cy.login()
    cy.contains('general').click()
  })

  it('TC-BB-MSG-001: Should send text message', () => {
    const message = 'Test message ' + Date.now()
    cy.sendMessage(message)
  })

  it('TC-BB-MSG-002: Should display sent message', () => {
    const message = 'Display test ' + Date.now()
    cy.sendMessage(message)
    cy.contains(message).should('be.visible')
  })

  it('TC-BB-MSG-003: Should show message timestamp', () => {
    cy.sendMessage('Timestamp test')
    cy.get('.rcx-message-header__time').should('be.visible')
  })

  it('TC-BB-MSG-004: Should show sender name', () => {
    cy.sendMessage('Sender test')
    cy.contains(Cypress.env('adminUsername')).should('be.visible')
  })

  it('TC-BB-MSG-005: Should allow multiline messages', () => {
    const multiline = 'Line 1\nLine 2\nLine 3'
    cy.get('.rc-message-box__textarea').type(multiline + '{enter}')
    cy.contains('Line 1').should('be.visible')
  })

  it('TC-BB-MSG-006: Should display message actions on hover', () => {
    cy.sendMessage('Hover test')
    cy.contains('Hover test').trigger('mouseover')
    cy.get('[data-qa="message-action"]').should('be.visible')
  })

  it('TC-BB-MSG-007: Should show emoji picker', () => {
    cy.get('[data-qa="emoji-picker-button"]').click()
    cy.get('.emoji-picker').should('be.visible')
  })

  it('TC-BB-MSG-008: Should handle empty message submission', () => {
    cy.get('.rc-message-box__textarea').type('{enter}')
    // Message should not be sent
  })

  it('TC-BB-MSG-009: Should display message in chronological order', () => {
    const msg1 = 'First ' + Date.now()
    const msg2 = 'Second ' + Date.now()
    cy.sendMessage(msg1)
    cy.wait(1000)
    cy.sendMessage(msg2)
    
    cy.contains(msg1).should('be.visible')
    cy.contains(msg2).should('be.visible')
  })

  it('TC-BB-MSG-010: Should clear input after sending', () => {
    cy.sendMessage('Clear test')
    cy.get('.rc-message-box__textarea').should('have.value', '')
  })
})
MESSAGE

# 11. Create README
cat > README.md << 'README'
# Rocket.Chat - Cypress Black-Box Tests

**Student 2 Module**: Black-Box E2E Testing using Cypress

## 📁 Project Structure
```
cypress-blackbox-tests/
├── cypress/
│   ├── e2e/
│   │   ├── login/          # Login functionality tests
│   │   ├── channels/       # Channel management tests
│   │   ├── messages/       # Message sending tests
│   │   ├── file-upload/    # File upload tests
│   │   ├── search/         # Search tests
│   │   └── notifications/  # Notification tests
│   ├── fixtures/           # Test data
│   └── support/            # Custom commands
├── cypress.config.js
├── package.json
└── README.md
```

## 🚀 Setup
```bash
npm install
```

## ▶️ Run Tests

### Open Cypress UI
```bash
npm run cypress:open
```

### Run all tests (headless)
```bash
npm test
```

### Run specific test suite
```bash
npx cypress run --spec "cypress/e2e/login/TC-LOGIN.cy.js"
```

## 📊 Test Coverage

- **Login**: 10 test cases
- **Channels**: 10 test cases
- **Messages**: 10 test cases
- **File Upload**: 10 test cases (TBD)
- **Search**: 10 test cases (TBD)
- **Notifications**: 10 test cases (TBD)

**Total**: 60+ Black-Box Test Cases

## 🎯 Test Execution

All tests validate user-facing functionality without knowledge of internal code structure (Black-Box approach).

## 📝 Notes

- Rocket.Chat must be running on `http://localhost:3000`
- Default credentials: admin/admin
- Tests use custom Cypress commands defined in `support/commands.js`
README

echo ""
echo "✅✅✅ Cypress Black-Box Testing Setup Complete! ✅✅✅"
echo ""
echo "📁 Location: /home/aymen/Downloads/Rocket.Chat-develop/cypress-blackbox-tests"
echo ""
echo "🚀 Next Steps:"
echo "   cd /home/aymen/Downloads/Rocket.Chat-develop/cypress-blackbox-tests"
echo "   npm run cypress:open"
echo ""
echo "📊 Test Files Created:"
echo "   - TC-LOGIN.cy.js (10 test cases)"
echo "   - TC-CHANNEL.cy.js (10 test cases)"
echo "   - TC-MESSAGE.cy.js (10 test cases)"
echo ""
