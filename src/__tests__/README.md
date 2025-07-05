# BASA Application Testing Suite

This directory contains a comprehensive testing suite for the BASA application using [Testcontainers for Node.js](https://node.testcontainers.org/). The testing suite provides isolated, reproducible test environments with real PostgreSQL databases and other services.

## 🏗️ Architecture

The testing suite is organized into several layers:

### 1. Testcontainers Setup (`setup/`)
- **`testcontainers-setup.ts`**: Core Testcontainers configuration and database management
- **`test-utils.ts`**: Utility functions for common testing operations
- **`global-setup.ts`**: Global setup for all tests
- **`global-teardown.ts`**: Global cleanup for all tests

### 2. Test Categories
- **`unit/`**: Unit tests for utility functions and isolated components
- **`integration/`**: Integration tests for API endpoints and database operations
- **`e2e/`**: End-to-end tests (future implementation)

## 🚀 Getting Started

### Prerequisites

1. **Docker**: Ensure Docker is running on your system
2. **Node.js**: Version 18 or higher
3. **pnpm**: Package manager

### Installation

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate
```

### Running Tests

```bash
# Run all tests (unit + integration)
pnpm test:all

# Run only unit tests
pnpm test:unit

# Run only integration tests with Testcontainers
pnpm test:containers:integration

# Run all Testcontainers tests
pnpm test:containers

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

## 📋 Test Categories

### Unit Tests (`unit/`)
- **Purpose**: Test isolated functions and utilities
- **Environment**: No database required
- **Speed**: Fast execution
- **Examples**: Utility functions, validation logic, helper methods

### Integration Tests (`integration/`)
- **Purpose**: Test API endpoints and database operations
- **Environment**: Isolated PostgreSQL container per test
- **Speed**: Medium execution (includes container startup)
- **Examples**: API routes, database queries, business logic

### End-to-End Tests (`e2e/`)
- **Purpose**: Test complete user workflows
- **Environment**: Full application stack
- **Speed**: Slow execution
- **Examples**: User registration, event creation, payment flows

## 🛠️ Test Utilities

### TestUtils Class

The `TestUtils` class provides common testing operations:

```typescript
import { TestUtils } from '../setup/test-utils';

// Create test environment with seeded data
const env = await TestUtils.createTestEnvironment();

// Create test environment without seeded data
const env = await TestUtils.createEmptyTestEnvironment();

// Create test users
const user = await TestUtils.createTestUser(prisma, 'test@example.com', 'MEMBER');

// Create test members
const member = await TestUtils.createTestMember(prisma, userId, 'Test Business');

// Create test events
const event = await TestUtils.createTestEvent(prisma, organizerId, 'Test Event');

// Create test resources
const resource = await TestUtils.createTestResource(prisma, 'Test Resource');

// Generate random test data
const data = TestUtils.generateRandomData();

// Mock environment variables
const mock = TestUtils.mockEnv({ NODE_ENV: 'test' });
// ... test code ...
mock.restore();

// Create mock request/response objects
const req = TestUtils.createMockRequest({ method: 'POST', body: data });
const res = TestUtils.createMockResponse();

// Wait for conditions
await TestUtils.waitFor(() => condition, 5000, 100);
```

### Test Helpers

```typescript
import { withTestDatabase, withEmptyTestDatabase } from '../setup/test-utils';

// Test with seeded database
it('should work with seeded data', withTestDatabase(async ({ database }) => {
  const { prisma } = database;
  // Test code here
}));

// Test with empty database
it('should work with empty database', withEmptyTestDatabase(async ({ database }) => {
  const { prisma } = database;
  // Test code here
}));
```

## 🗄️ Database Testing

### Testcontainers Setup

Each integration test gets its own isolated PostgreSQL container:

```typescript
describe('Database Integration Tests', () => {
  it('should create and retrieve users', withEmptyTestDatabase(async ({ database }) => {
    const { prisma } = database;
    
    // Create test data
    const user = await TestUtils.createTestUser(prisma, 'test@example.com', 'MEMBER');
    
    // Verify data
    expect(user.email).toBe('test@example.com');
    expect(user.role).toBe('MEMBER');
    
    // Test database operations
    const retrievedUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });
    expect(retrievedUser).toBeTruthy();
  }));
});
```

### Database Assertions

```typescript
// Assert record exists
await TestUtils.assertRecordExists(prisma, 'user', { email: 'test@example.com' });

// Assert record doesn't exist
await TestUtils.assertRecordNotExists(prisma, 'user', { email: 'nonexistent@example.com' });

// Count records
const userCount = await TestUtils.countRecords(prisma, 'user');
expect(userCount).toBe(1);
```

## 🔧 Configuration

### Jest Configuration

The testing suite uses two Jest configurations:

1. **Default (`jest.config.js`)**: For unit tests and general testing
2. **Testcontainers (`jest.config.testcontainers.js`)**: For integration tests with containers

### Environment Variables

Test environment variables are automatically set:

```typescript
// In tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test_user:test_password@localhost:5432/basa_test';
```

## 📊 Test Coverage

The testing suite aims for comprehensive coverage:

- **Unit Tests**: 90%+ coverage for utility functions
- **Integration Tests**: All API endpoints and database operations
- **End-to-End Tests**: Critical user workflows

## 🐛 Debugging Tests

### Container Logs

```typescript
// Access container logs in tests
const { database } = await TestUtils.createTestEnvironment();
console.log('Container logs:', await database.container.logs());
```

### Database Inspection

```typescript
// Inspect database state
const users = await prisma.user.findMany();
console.log('Users in database:', users);
```

### Container Statistics

```typescript
// Get container statistics
const stats = TestUtils.getContainerStats();
console.log('Running containers:', stats.running);
```

## 🚨 Common Issues

### Container Startup Failures

1. **Docker not running**: Ensure Docker is started
2. **Port conflicts**: Check for existing PostgreSQL instances
3. **Insufficient resources**: Increase Docker memory/CPU limits

### Database Connection Issues

1. **Migration failures**: Ensure Prisma migrations are up to date
2. **Schema mismatches**: Regenerate Prisma client
3. **Connection timeouts**: Increase container startup timeout

### Test Failures

1. **Race conditions**: Use `TestUtils.waitFor()` for async operations
2. **Data isolation**: Each test gets a fresh database
3. **Cleanup issues**: Ensure proper cleanup in test teardown

## 📈 Performance

### Test Execution Times

- **Unit Tests**: < 1 second per test
- **Integration Tests**: 2-5 seconds per test (includes container startup)
- **End-to-End Tests**: 10-30 seconds per test

### Optimization Tips

1. **Parallel execution**: Unit tests can run in parallel
2. **Container reuse**: Integration tests use isolated containers
3. **Efficient cleanup**: Automatic container cleanup after tests

## 🔄 Continuous Integration

The testing suite is designed for CI/CD environments:

```yaml
# GitHub Actions example
- name: Run tests
  run: |
    pnpm test:all
    pnpm test:coverage
```

## 📚 Additional Resources

- [Testcontainers for Node.js Documentation](https://node.testcontainers.org/)
- [Jest Testing Framework](https://jestjs.io/)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
- [Next.js Testing](https://nextjs.org/docs/testing)

## 🤝 Contributing

When adding new tests:

1. **Follow naming conventions**: `*.test.ts` for test files
2. **Use appropriate test category**: unit, integration, or e2e
3. **Include proper cleanup**: Use test helpers for database cleanup
4. **Add documentation**: Document complex test scenarios
5. **Maintain coverage**: Ensure new code is properly tested

## 📝 Test Examples

### API Integration Test

```typescript
describe('Events API', () => {
  it('should create a new event', withTestDatabase(async ({ database }) => {
    const { prisma } = database;
    
    // Setup
    const user = await TestUtils.createTestUser(prisma, 'organizer@test.com', 'MEMBER');
    const member = await TestUtils.createTestMember(prisma, user.id, 'Test Organizer');
    
    // Test data
    const eventData = {
      title: 'New Test Event',
      description: 'A test event',
      startDate: new Date().toISOString(),
      // ... other fields
    };
    
    // Mock request
    const req = TestUtils.createMockRequest({
      method: 'POST',
      body: eventData,
      headers: { 'x-user-id': user.id },
    });
    const res = TestUtils.createMockResponse();
    
    // Execute
    await POST(req, res);
    
    // Assertions
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        event: expect.objectContaining({
          title: 'New Test Event',
        }),
      })
    );
    
    // Verify database
    await TestUtils.assertRecordExists(prisma, 'event', {
      title: 'New Test Event',
    });
  }));
});
```

### Database Integration Test

```typescript
describe('User Management', () => {
  it('should handle user role updates', withEmptyTestDatabase(async ({ database }) => {
    const { prisma } = database;
    
    // Create user
    const user = await TestUtils.createTestUser(prisma, 'test@example.com', 'GUEST');
    expect(user.role).toBe('GUEST');
    
    // Update role
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' },
    });
    
    // Verify update
    expect(updatedUser.role).toBe('ADMIN');
    
    // Verify in database
    const retrievedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    expect(retrievedUser?.role).toBe('ADMIN');
  }));
});
``` 