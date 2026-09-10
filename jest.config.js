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
    // ESM-only packages have to be transformed rather than skipped.
    //
    // Two things make this fiddly, and both bit while adding sanitize-html:
    //
    // 1. next/jest prepends its own patterns, built from `transpilePackages` in
    //    next.config.js. Patterns are OR'd, so a package missing from THERE stays
    //    ignored no matter what is written here. Add ESM deps in both places.
    // 2. pnpm stores real packages at node_modules/.pnpm/<pkg>@<ver>/node_modules/<pkg>,
    //    one level deeper than npm. A pattern written for a flat layout never
    //    matches its own allowlist, so it quietly ignores everything - which is
    //    what the previous version of this line did.
    'node_modules/(?!(?:\\.pnpm/[^/]+/node_modules/)?(testcontainers|@testcontainers|yaml|docker-compose|sanitize-html|htmlparser2|domhandler|domutils|domelementtype|dom-serializer|entities)/)',
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