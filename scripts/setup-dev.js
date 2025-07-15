#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up BASA development environment...');

try {
  // Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.development');
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  .env.development not found. Please create it from .env.development.example');
    process.exit(1);
  }

  // Generate Prisma client
  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Run migrations
  console.log('📦 Running database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  // Seed the database
  console.log('🌱 Seeding database...');
  execSync('pnpm run db:seed', { stdio: 'inherit' });

  console.log('✅ Development environment setup complete!');
  console.log('🚀 You can now run: pnpm dev');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
} 