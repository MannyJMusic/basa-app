const TestcontainersSetup = require('./testcontainers-setup').default;

/**
 * Global teardown for Testcontainers tests
 * This runs once after all tests complete
 */
module.exports = async function globalTeardown() {
  console.log('🧹 Cleaning up Testcontainers global environment...');
  try {
    // Clean up all containers
    const setup = TestcontainersSetup.getInstance();
    await setup.cleanup();
    // Get final statistics
    const stats = setup.getContainerStats();
    console.log(`📊 Container stats: ${stats.total} total, ${stats.running} running`);
    console.log('✅ Testcontainers global teardown completed');
  } catch (error) {
    console.error('❌ Testcontainers global teardown failed:', error);
    // Don't throw here as it might mask test failures
  }
}; 