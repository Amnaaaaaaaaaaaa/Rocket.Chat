/**
 * Mock for @rocket.chat/logger
 */
class MockLogger {
  constructor(name) {
    this.name = name;
  }
  
  debug = jest.fn();
  info = jest.fn();
  warn = jest.fn();
  error = jest.fn();
}

module.exports = {
  Logger: MockLogger
};
