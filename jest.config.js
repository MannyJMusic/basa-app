const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
  typescript: {
    config: './tsconfig.test.json',
  },
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/cypress/',
    '<rootDir>/src/__tests__/integration/',
    '<rootDir>/src/__tests__/helpers/',
  ],
  // Handle ES modules from Testcontainers
  transformIgnorePatterns: [
    'node_modules/(?!(testcontainers|@testcontainers|yaml|docker-compose)/)',
  ],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig) 