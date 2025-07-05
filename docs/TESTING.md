# Testing Guide

This document provides a comprehensive guide to testing the BASA application, including unit tests, integration tests, and end-to-end tests.

## Overview

The BASA application uses a multi-layered testing approach:

- **Unit Tests**: Fast, isolated tests for individual functions and components
- **Integration Tests**: Tests with real database containers using Testcontainers
- **End-to-End Tests**: Full application testing with Cypress

## Quick Start

```bash
# Run all tests
pnpm test:all

# Run unit tests only
pnpm test:unit

# Run integration tests only
pnpm test:integration

# Run end-to-end tests
pnpm e2e

# Setup Testcontainers Cloud
pnpm setup:testcontainers
```

## Test Structure

```
src/__tests__/
├── unit/                    # Unit tests (fast, no containers)
├── integration/             # Integration tests (with containers)
│   ├── helpers/            # Test utilities and setup
│   │   ├── testcontainers-setup.ts
│   │   ├── test-utils.ts
│   │   ├── global-setup.ts
│   │   └── global-teardown.ts
│   ├── database.test.ts    # Database integration tests
│   └── api-events.test.ts  # API integration tests
└── __mocks__/              # Jest mocks
```

## Unit Tests

Unit tests are fast, isolated tests that don't require external dependencies.

### Configuration
- **Config**: `jest.config.js`
- **Environment**: Node.js (no DOM)
- **Dependencies**: Mocked where needed

### Running Unit Tests

```bash
# Run all unit tests
pnpm test:unit

# Run with watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test:unit -- src/__tests__/unit/utils.test.ts
```

### Writing Unit Tests

```typescript
import { TestUtils } from '../integration/helpers/test-utils';

describe('Utility Functions', () => {
  it('should generate unique data', () => {
    const data1 = TestUtils.generateRandomData();
    const data2 = TestUtils.generateRandomData();
    
    expect(data1.email).not.toBe(data2.email);
  });
});
```

## Integration Tests

Integration tests use Testcontainers to create real PostgreSQL containers for testing database interactions.

### Configuration
- **Config**: `jest.config.testcontainers.js`
- **Environment**: Node.js with Testcontainers
- **Database**: Isolated PostgreSQL containers

### Running Integration Tests

```bash
# Run all integration tests
pnpm test:integration

# Run specific test file
pnpm test:integration -- src/__tests__/integration/database.test.ts

# Run with debug output
DEBUG=testcontainers:* pnpm test:integration
```

### Testcontainers Setup

Integration tests automatically:
- Create isolated PostgreSQL containers
- Run database migrations
- Seed test data (optional)
- Clean up containers after tests

### Writing Integration Tests

```typescript
import { withEmptyTestDatabase } from '../helpers/test-utils';
import { TestUtils } from '../helpers/test-utils';

describe('Database Integration Tests', () => {
  it('should create and retrieve users', 
    withEmptyTestDatabase(async ({ database }) => {
      const { prisma } = database;
      
      const user = await TestUtils.createTestUser(
        prisma, 
        'test@example.com', 
        'MEMBER'
      );
      
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe('MEMBER');
    })
  );
});
```

## Testcontainers Cloud

For CI/CD environments, the application supports Testcontainers Cloud for managed containers.

### Setup

1. **Get Token**: Visit [Testcontainers Cloud](https://app.testcontainers.cloud/accounts/31796/start/download?group=ci)
2. **Add to .env**: `TC_CLOUD_TOKEN=your_token_here`
3. **Add GitHub Secret**: `TESTCONTAINERS_CLOUD_TOKEN`
4. **Run Setup**: `pnpm setup:testcontainers`

### Benefits

- **CI/CD Friendly**: No Docker-in-Docker complexity
- **Parallel Execution**: Multiple containers simultaneously
- **Managed Infrastructure**: No local Docker required
- **Cost Effective**: Pay-per-use pricing

## End-to-End Tests

End-to-end tests use Cypress to test the full application in a browser environment.

### Running E2E Tests

```bash
# Run all E2E tests
pnpm e2e

# Open Cypress UI
pnpm cypress:open

# Run specific test file
pnpm cypress:run --spec "cypress/e2e/login.cy.ts"
```

### Writing E2E Tests

```typescript
describe('User Authentication', () => {
  it('should allow user to sign in', () => {
    cy.visit('/auth/sign-in');
    cy.get('[data-testid="email"]').type('test@example.com');
    cy.get('[data-testid="password"]').type('password123');
    cy.get('[data-testid="sign-in-button"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

## Test Utilities

### TestUtils Class

The `TestUtils` class provides helper functions for creating test data:

```typescript
// Create test users
const user = await TestUtils.createTestUser(prisma, 'test@example.com', 'MEMBER');

// Create test members
const member = await TestUtils.createTestMember(prisma, user.id, 'Test Business');

// Create test events
const event = await TestUtils.createTestEvent(prisma, member.id, 'Test Event');

// Create test resources
const resource = await TestUtils.createTestResource(prisma, 'Test Resource');
```

### Test Environment Helpers

```typescript
// Test with seeded data
withTestDatabase(async ({ database }) => {
  // Database has seed data
});

// Test with empty database
withEmptyTestDatabase(async ({ database }) => {
  // Clean database
});
```

## GitHub Actions Integration

The CI/CD pipeline automatically runs tests using Testcontainers Cloud:

```yaml
- name: Setup Testcontainers Cloud
  run: |
    echo "TC_CLOUD_TOKEN=${{ secrets.TESTCONTAINERS_CLOUD_TOKEN }}" >> $GITHUB_ENV

- name: Run integration tests
  run: pnpm test:integration
  env:
    TC_CLOUD_TOKEN: ${{ secrets.TESTCONTAINERS_CLOUD_TOKEN }}
```

## Best Practices

### Test Organization

1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test database interactions and API endpoints
3. **E2E Tests**: Test complete user workflows

### Test Data

1. **Use TestUtils**: Create consistent test data
2. **Clean Up**: Always clean up after tests
3. **Isolation**: Each test should be independent

### Performance

1. **Parallel Execution**: Run tests in parallel when possible
2. **Container Reuse**: Testcontainers optimizes container lifecycle
3. **Mock External Services**: Don't test external APIs in unit tests

### Debugging

1. **Debug Mode**: Use `DEBUG=testcontainers:*` for container logs
2. **Test Isolation**: Check for shared state between tests
3. **Container Logs**: Review container logs for failures

## Troubleshooting

### Common Issues

1. **Container Startup Failures**
   - Check Docker is running
   - Verify network connectivity
   - Increase timeout values

2. **Database Connection Issues**
   - Ensure migrations are up to date
   - Check database URL format
   - Verify container health

3. **Test Failures**
   - Check for shared state between tests
   - Verify test data cleanup
   - Review test isolation

### Getting Help

1. **Documentation**: See `docs/TESTCONTAINERS_SETUP.md`
2. **Setup Script**: Run `pnpm setup:testcontainers`
3. **Debug Mode**: Use debug flags for detailed output
4. **Logs**: Check container and test logs

## Monitoring

- **Test Coverage**: Run `pnpm test:coverage`
- **Performance**: Monitor test execution times
- **Container Usage**: Track Testcontainers Cloud usage
- **CI/CD Metrics**: Monitor GitHub Actions performance 