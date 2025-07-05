const TestcontainersSetup = require('./testcontainers-setup').default;

/**
 * Global setup for Testcontainers tests
 * This runs once before all tests
 */
module.exports = async function globalSetup() {
  console.log('🚀 Setting up Testcontainers global environment...');
  try {
    // Initialize the Testcontainers setup
    const setup = TestcontainersSetup.getInstance();
    // Set up any global test environment variables
    process.env.NODE_ENV = 'test';
    process.env.JEST_WORKER_ID = '1';
    console.log('✅ Testcontainers global setup completed');
  } catch (error) {
    console.error('❌ Testcontainers global setup failed:', error);
    throw error;
  }
}; 