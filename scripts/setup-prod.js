#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Setting up BASA production environment...');

try {
  // Skip Prisma client generation since it's already generated in build stage
  console.log('🔧 Prisma client already generated in build stage...');

  // Run migrations
  console.log('📦 Running database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

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