// Jest setup for integration tests
import { jest } from '@jest/globals';

// Mock Next.js modules that cause issues in test environment
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

jest.mock('next/headers', () => ({
  headers: () => new Map(),
  cookies: () => new Map(),
}));

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';

// Global test timeout
jest.setTimeout(120000);

// Suppress console logs during tests unless there's an error
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = originalConsoleError; // Keep error logging
});

afterAll(() => {
  console.log = originalConsoleLog;
});

// Global test utilities
global.TestUtils = {
  generateRandomData: () => ({
    email: `test-${Date.now()}@example.com`,
    businessName: `Test Business ${Date.now()}`,
    eventTitle: `Test Event ${Date.now()}`,
    resourceTitle: `Test Resource ${Date.now()}`,
  }),
}; 