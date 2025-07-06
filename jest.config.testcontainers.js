module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/integration/**/*.test.ts',
    '**/__tests__/integration/**/*.test.tsx',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/integration/helpers/jest-setup.ts'],
  globalSetup: '<rootDir>/src/__tests__/integration/helpers/global-setup.ts',
  globalTeardown: '<rootDir>/src/__tests__/integration/helpers/global-teardown.ts',
  testTimeout: 120000, // 2 minutes for container startup
  // Reduce concurrent workers to prevent "too many engines" error
  maxWorkers: 1,
  // Run tests serially to avoid Prisma client conflicts
  runInBand: true,
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        target: 'es2020',
        module: 'esnext',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        moduleResolution: 'node',
      },
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(next-auth|@auth|@prisma/client|testcontainers|@testcontainers|yaml|docker-compose)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/dist/',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  // Add environment variables for Prisma
  setupFiles: ['<rootDir>/src/__tests__/integration/helpers/prisma-setup.ts'],
}; 