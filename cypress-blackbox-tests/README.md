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
