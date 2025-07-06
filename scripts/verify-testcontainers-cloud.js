#!/usr/bin/env node

/**
 * Verification script for Testcontainers Cloud
 * Tests connectivity and container creation
 */

const { PostgreSqlContainer } = require('@testcontainers/postgresql');

async function verifyTestcontainersCloud() {
  console.log('🔍 Verifying Testcontainers Cloud setup...\n');

  // Check environment
  const isCloud = !!process.env.TC_CLOUD_TOKEN;
  console.log(`Environment: ${isCloud ? '🌐 Testcontainers Cloud' : '🏠 Local'}`);
  console.log(`TC_CLOUD_TOKEN present: ${isCloud ? '✅ YES' : '❌ NO'}\n`);

  if (!isCloud) {
    console.log('⚠️  No TC_CLOUD_TOKEN found. This will use local Testcontainers.');
    console.log('   To use Testcontainers Cloud, set TC_CLOUD_TOKEN environment variable.\n');
  }

  try {
    console.log('🚀 Testing container creation...');
    
    const container = await new PostgreSqlContainer('postgres:15-alpine')
      .withDatabase('test_verify')
      .withUsername('test')
      .withPassword('test')
      .withStartupTimeout(60000)
      .start();

    console.log('✅ Container created successfully!');
    console.log(`   - Container ID: ${container.getId()}`);
    console.log(`   - Database URL: ${container.getConnectionUri()}`);
    console.log(`   - Environment: ${isCloud ? 'Cloud' : 'Local'}`);

    // Test database connection
    console.log('\n🔌 Testing database connection...');
    const { Client } = require('pg');
    const client = new Client({
      connectionString: container.getConnectionUri()
    });

    await client.connect();
    const result = await client.query('SELECT version()');
    console.log('✅ Database connection successful!');
    console.log(`   - PostgreSQL version: ${result.rows[0].version.split(' ')[0]}`);

    await client.end();
    await container.stop();
    
    console.log('\n🎉 Testcontainers Cloud verification completed successfully!');
    console.log(`   - Container creation: ✅`);
    console.log(`   - Database connection: ✅`);
    console.log(`   - Container cleanup: ✅`);

  } catch (error) {
    console.error('\n❌ Testcontainers Cloud verification failed:');
    console.error(error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Troubleshooting tips:');
      console.error('   - Check if TC_CLOUD_TOKEN is valid');
      console.error('   - Verify internet connectivity');
      console.error('   - Check Testcontainers Cloud service status');
    }
    
    process.exit(1);
  }
}

// Run verification
verifyTestcontainersCloud().catch(console.error); 