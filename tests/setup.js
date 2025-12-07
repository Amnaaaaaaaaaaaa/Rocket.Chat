// Global test setup
jest.setTimeout(30000);

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Mock process.exit to prevent tests from exiting
process.exit = jest.fn();

// Add custom matchers
expect.extend({
  toBeMeteorError(received, expectedCode) {
    const pass = received && received.error === expectedCode;
    return {
      message: () => `expected ${received} to be Meteor error ${expectedCode}`,
      pass,
    };
  },
});
