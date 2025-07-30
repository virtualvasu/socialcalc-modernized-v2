/**
 * Jest Configuration for SocialCalc/EtherCalc Test Suite
 */

module.exports = {
  // Test environment
  testEnvironment: 'jsdom',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],

  // Files to exclude from testing
  testPathIgnorePatterns: [
    '/node_modules/',
    '/lib/vendor/',
    '/static/',
    '/dist/'
  ],

  // Coverage collection
  collectCoverageFrom: [
    'src/js/**/*.js',
    '!src/js/**/*.min.js',
    '!lib/vendor/**/*',
    '!static/**/*'
  ],

  // Coverage output
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // Module name mapping for path aliases
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },

  // Transform files
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // Global variables
  globals: {
    SocialCalc: {}
  },

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Collect coverage from untested files
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js'
  ]
};