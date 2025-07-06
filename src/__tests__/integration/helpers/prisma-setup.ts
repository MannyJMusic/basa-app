// Prisma setup for integration tests
// This file configures Prisma-specific settings after environment variables are set

// Set default database URL (will be overridden by Testcontainers)
process.env.DATABASE_URL = 'postgresql://test_user:test_password@localhost:5432/basa_test';

console.log('🔧 Prisma test environment configured');
console.log('   - NODE_ENV:', process.env.NODE_ENV);
console.log('   - PRISMA_CLIENT_ENGINE_TYPE:', process.env.PRISMA_CLIENT_ENGINE_TYPE);
console.log('   - Connection pool limits:', process.env.DATABASE_POOL_MIN, '-', process.env.DATABASE_POOL_MAX);
console.log('   - Test timeout:', process.env.TEST_TIMEOUT); 