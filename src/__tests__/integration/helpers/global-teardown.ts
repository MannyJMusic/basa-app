const TestcontainersSetup = require('./testcontainers-setup').default;

/**
 * Global teardown for Testcontainers tests
 * This runs once after all tests
 */
module.exports = async function globalTeardown() {
  console.log('🧹 Cleaning up Testcontainers global environment...');
  try {
    const setup = TestcontainersSetup.getInstance();
    
    // Clean up the shared container and all resources
    await setup.cleanup();
    
    console.log('✅ Testcontainers global teardown completed');
  } catch (error) {
    console.error('❌ Testcontainers global teardown failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  }
}; 