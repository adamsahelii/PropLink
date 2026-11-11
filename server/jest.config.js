module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/tests/env.js'],
  testTimeout: 30000,
  // Run test files one at a time: each spins up its own in-memory MongoDB.
  maxWorkers: 1,
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'models/**/*.js',
    'utils/**/*.js',
  ],
}
