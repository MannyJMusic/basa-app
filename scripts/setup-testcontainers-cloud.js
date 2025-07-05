#!/usr/bin/env node

/**
 * Setup script for Testcontainers Cloud
 * Helps users configure Testcontainers Cloud for CI/CD
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Testcontainers Cloud Setup');
console.log('=============================\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ Found .env file');
  
  // Check if TC_CLOUD_TOKEN is already set
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('TC_CLOUD_TOKEN=')) {
    console.log('✅ TC_CLOUD_TOKEN is already configured in .env');
  } else {
    console.log('⚠️  TC_CLOUD_TOKEN not found in .env');
    console.log('   Add your Testcontainers Cloud token to .env:');
    console.log('   TC_CLOUD_TOKEN=your_token_here\n');
  }
} else {
  console.log('⚠️  No .env file found');
  console.log('   Create a .env file and add:');
  console.log('   TC_CLOUD_TOKEN=your_token_here\n');
}

// Check GitHub Actions configuration
const workflowPath = path.join(process.cwd(), '.github', 'workflows', 'ci-cd.yml');
if (fs.existsSync(workflowPath)) {
  console.log('✅ GitHub Actions workflow found');
  
  const workflowContent = fs.readFileSync(workflowPath, 'utf8');
  if (workflowContent.includes('TESTCONTAINERS_CLOUD_TOKEN')) {
    console.log('✅ Testcontainers Cloud is configured in GitHub Actions');
  } else {
    console.log('⚠️  Testcontainers Cloud not configured in GitHub Actions');
  }
} else {
  console.log('⚠️  GitHub Actions workflow not found');
}

console.log('\n📋 Next Steps:');
console.log('1. Get your Testcontainers Cloud token from:');
console.log('   https://app.testcontainers.cloud/accounts/31796/start/download?group=ci');
console.log('\n2. Add the token to your .env file:');
console.log('   TC_CLOUD_TOKEN=your_token_here');
console.log('\n3. Add the token as a GitHub secret:');
console.log('   - Go to your repository settings');
console.log('   - Navigate to Secrets and variables → Actions');
console.log('   - Add secret: TESTCONTAINERS_CLOUD_TOKEN');
console.log('\n4. Test the setup:');
console.log('   pnpm test:integration');
console.log('\n📚 For more information, see: docs/TESTCONTAINERS_SETUP.md'); 