// Prisma setup for integration tests
// This file configures environment variables and connection limits

// Set environment variables for Prisma
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test_user:test_password@localhost:5432/basa_test';

// Configure Prisma connection limits
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'binary';
process.env.PRISMA_QUERY_ENGINE_TYPE = 'binary';

// Set connection pool limits to prevent "too many engines" error
process.env.DATABASE_CONNECTION_LIMIT = '5';
process.env.DATABASE_POOL_MIN = '1';
process.env.DATABASE_POOL_MAX = '3';

// Disable Prisma logging in tests for cleaner output
process.env.PRISMA_LOG_LEVEL = 'error';

// Set test-specific timeouts
process.env.TEST_TIMEOUT = '120000';
process.env.CONTAINER_STARTUP_TIMEOUT = '60000';

console.log('🔧 Prisma test environment configured');
console.log('   - NODE_ENV:', process.env.NODE_ENV);
console.log('   - Connection pool limits:', process.env.DATABASE_POOL_MIN, '-', process.env.DATABASE_POOL_MAX);
console.log('   - Test timeout:', process.env.TEST_TIMEOUT); 