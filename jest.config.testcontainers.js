module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/integration/**/*.test.ts',
    '**/__tests__/integration/**/*.test.tsx',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/integration/helpers/prisma-setup.ts'],
  globalSetup: '<rootDir>/src/__tests__/integration/helpers/global-setup.ts',
  globalTeardown: '<rootDir>/src/__tests__/integration/helpers/global-teardown.ts',
  testTimeout: 120000, // 2 minutes
  maxWorkers: 1, // Run tests serially to avoid Prisma client conflicts
  forceExit: true, // Force exit after tests complete
  detectOpenHandles: true, // Detect async operations that keep running
  verbose: true,
  collectCoverage: false, // Disable coverage for integration tests
  coverageDirectory: 'coverage/integration',
  coverageReporters: ['text', 'lcov', 'html'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    '/coverage/',
    '/dist/',
    '/build/',
  ],
  // Testcontainers specific settings
  testPathIgnorePatterns: [
    '/node_modules/',
    '/unit/',
  ],
  // Environment variables for tests
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  // Handle ES modules
  extensionsToTreatAsEsm: ['.ts'],
}; 