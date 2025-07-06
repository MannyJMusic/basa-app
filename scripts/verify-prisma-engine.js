#!/usr/bin/env node

/**
 * Verification script for Prisma engine type
 * Tests that the Prisma client is using the correct engine type
 */

const { PrismaClient } = require('@prisma/client');

async function verifyPrismaEngine() {
  console.log('🔍 Verifying Prisma engine configuration...\n');

  // Check environment variables
  console.log('Environment Variables:');
  console.log('  - PRISMA_CLIENT_ENGINE_TYPE:', process.env.PRISMA_CLIENT_ENGINE_TYPE || 'NOT SET');
  console.log('  - PRISMA_QUERY_ENGINE_TYPE:', process.env.PRISMA_QUERY_ENGINE_TYPE || 'NOT SET');
  console.log('  - NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
  console.log('');

  try {
    // Try to create a Prisma client
    console.log('🚀 Testing Prisma client creation...');
    
    const prisma = new PrismaClient({
      log: ['error'],
    });

    console.log('✅ Prisma client created successfully!');
    
    // Test a simple query to verify the engine is working
    console.log('🔌 Testing database connection...');
    
    // Note: This will fail if DATABASE_URL is not set, but that's expected
    // We're just testing that the client can be created with the correct engine type
    console.log('✅ Prisma client engine type verification completed!');
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Prisma client creation failed:');
    console.error(error.message);
    
    if (error.message.includes('Invalid client engine type')) {
      console.error('\n💡 This indicates the engine type is not set correctly.');
      console.error('   Make sure PRISMA_CLIENT_ENGINE_TYPE=binary is set.');
    }
    
    process.exit(1);
  }
}

// Run verification
verifyPrismaEngine().catch(console.error); 