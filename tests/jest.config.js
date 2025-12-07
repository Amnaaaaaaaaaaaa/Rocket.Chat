module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test files location
  testMatch: [
    '**/unit/**/*.test.js',
    '**/unit/**/*.spec.js'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: '../coverage',
  coverageReporters: ['html', 'text', 'lcov', 'json'],
  
  // Collect coverage from test files
  collectCoverageFrom: [
    'unit/**/*.test.js',
    'unit/**/*.js',
    '!**/node_modules/**',
  ],
  
  // Coverage thresholds (optional)
  coverageThresholds: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  
  // Ignore patterns
  coveragePathIgnorePatterns: [
    '/node_modules/',
  ],
  
  // Module paths
  roots: ['<rootDir>'],
  
  // Verbose output
  verbose: true,
};
