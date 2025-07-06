// Environment setup for integration tests
// This file runs before any imports to ensure environment variables are set correctly

// Set Prisma environment variables at the very beginning
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'binary';
process.env.PRISMA_QUERY_ENGINE_TYPE = 'binary';
process.env.NODE_ENV = 'test';

// Set connection pool limits to prevent "too many engines" error
process.env.DATABASE_CONNECTION_LIMIT = '5';
process.env.DATABASE_POOL_MIN = '1';
process.env.DATABASE_POOL_MAX = '3';

// Disable Prisma logging in tests for cleaner output
process.env.PRISMA_LOG_LEVEL = 'error';

// Set test-specific timeouts
process.env.TEST_TIMEOUT = '120000';
process.env.CONTAINER_STARTUP_TIMEOUT = '60000';

console.log('🔧 Environment setup completed');
console.log('   - PRISMA_CLIENT_ENGINE_TYPE:', process.env.PRISMA_CLIENT_ENGINE_TYPE);
console.log('   - NODE_ENV:', process.env.NODE_ENV); 