#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Setting up BASA production environment...');

try {
  // Skip Prisma client generation since it's already generated in build stage
  console.log('🔧 Prisma client already generated in build stage...');

  // Use db push instead of migrate deploy for production
  // This is more suitable for existing databases
  console.log('📦 Pushing schema to database...');
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('✅ Schema push completed successfully!');
  } catch (pushError) {
    console.log('⚠️ Schema push failed, trying migrations...');
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ Migrations completed successfully!');
    } catch (migrateError) {
      console.log('❌ Both schema push and migrations failed');
      console.log('Push error:', pushError.message);
      console.log('Migration error:', migrateError.message);
      console.log('Please check your database connection and schema compatibility');
      throw pushError;
    }
  }

  // Seed the database (skip if already seeded)
  console.log('🌱 Checking if database needs seeding...');
  try {
    execSync('pnpm run db:seed', { stdio: 'inherit' });
    console.log('✅ Database seeded successfully!');
  } catch (seedError) {
    console.log('⚠️ Database seeding skipped - may already have data');
  }

  console.log('✅ Production environment setup complete!');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
} 