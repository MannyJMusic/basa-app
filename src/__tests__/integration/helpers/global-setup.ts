// Set Prisma environment variables before any imports
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'binary';
process.env.PRISMA_QUERY_ENGINE_TYPE = 'binary';
process.env.NODE_ENV = 'test';

const TestcontainersSetup = require('./testcontainers-setup').default;

/**
 * Global setup for Testcontainers tests
 * This runs once before all tests
 */
module.exports = async function globalSetup() {
  console.log('🚀 Setting up Testcontainers global environment...');
  try {
    // Initialize the Testcontainers setup and create shared container
    const setup = TestcontainersSetup.getInstance();
    
    // Create the shared container that will be reused across all tests
    console.log('🔧 Initializing shared test database...');
    await setup.getSharedTestDatabase();
    
    console.log('✅ Testcontainers global setup completed');
    console.log('   - Shared container created and ready');
    console.log('   - Database migrations applied');
    console.log('   - All tests will reuse this container');
  } catch (error) {
    console.error('❌ Testcontainers global setup failed:', error);
    throw error;
  }
}; 