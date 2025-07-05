#!/usr/bin/env node

/**
 * Comprehensive System Testing Script
 * Consolidates health checks, API tests, database checks, and email system tests
 */

// Use built-in modules instead of fetch
const http = require('http');
const https = require('https');
const url = require('url');
require('dotenv').config({ path: '.env.local' });

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}[${new Date().toISOString()}]${colors.reset} ${message}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function warning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️ ${message}`, 'blue');
}

// Simple HTTP request function
function makeRequest(urlString) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(urlString);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.path,
      method: 'GET',
      timeout: 5000
    };
    
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 300,
          data: data
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Health check functions
async function testHealthEndpoints() {
  info('Testing health endpoints...');
  
  const endpoints = [
    { name: 'Local Health', url: 'http://localhost:3000/api/health' },
    { name: 'Docker Health', url: 'http://localhost:3001/api/health' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(endpoint.url);
      if (response.ok) {
        success(`${endpoint.name}: ${response.status} - OK`);
      } else {
        error(`${endpoint.name}: ${response.status} - Failed`);
      }
    } catch (err) {
      error(`${endpoint.name}: Connection failed - ${err.message}`);
    }
  }
}

async function testAPIEndpoints() {
  info('Testing API endpoints...');
  
  const endpoints = [
    { name: 'Events API', url: 'http://localhost:3000/api/events?status=PUBLISHED&sortBy=startDate&sortOrder=asc' },
    { name: 'Members API', url: 'http://localhost:3000/api/members' },
    { name: 'Resources API', url: 'http://localhost:3000/api/resources' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(endpoint.url);
      if (response.ok) {
        success(`${endpoint.name}: ${response.status} - OK`);
      } else {
        error(`${endpoint.name}: ${response.status} - Failed`);
      }
    } catch (err) {
      error(`${endpoint.name}: Connection failed - ${err.message}`);
    }
  }
}

async function checkDatabase() {
  info('Checking database state...');
  
  try {
    // Try to import Prisma client
    let prisma;
    try {
      const { PrismaClient } = require('@prisma/client');
      prisma = new PrismaClient();
    } catch (err) {
      warning('Prisma client not available, skipping database checks');
      return;
    }
    
    // Check users
    const users = await prisma.user.findMany();
    success(`Users: ${users.length}`);
    
    // Check members
    const members = await prisma.member.findMany();
    success(`Members: ${members.length}`);
    
    // Check events
    const events = await prisma.event.findMany();
    success(`Events: ${events.length}`);
    
    // Check settings
    const settings = await prisma.settings.findFirst();
    success(`Settings: ${settings ? 'Exists' : 'Missing'}`);
    
    // Show some sample data
    if (users.length > 0) {
      info(`Sample user: ${users[0].email} (${users[0].role})`);
    }
    if (members.length > 0) {
      info(`Sample member: ${members[0].businessName} (${members[0].membershipTier})`);
    }
    if (events.length > 0) {
      info(`Sample event: ${events[0].title} (${events[0].status})`);
    }
    
    await prisma.$disconnect();
    
  } catch (err) {
    error(`Database check failed: ${err.message}`);
  }
}

async function testMailgunConfiguration() {
  info('Testing Mailgun configuration...');
  
  try {
    const formData = require('form-data');
    const Mailgun = require('mailgun.js');
  } catch (err) {
    warning('Mailgun dependencies not available, skipping email tests');
    return;
  }
  
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const fromEmail = process.env.MAILGUN_FROM_EMAIL;
  
  // Check environment variables
  if (!apiKey) {
    error('MAILGUN_API_KEY is missing');
    return false;
  }
  if (!domain) {
    error('MAILGUN_DOMAIN is missing');
    return false;
  }
  if (!fromEmail) {
    error('MAILGUN_FROM_EMAIL is missing');
    return false;
  }
  
  success('All Mailgun environment variables are set');
  
  try {
    const formData = require('form-data');
    const Mailgun = require('mailgun.js');
    const mailgun = new Mailgun(formData);
    const mg = mailgun.client({
      username: 'api',
      key: apiKey,
    });

    // Test domain access
    const domainResponse = await mg.domains.get(domain);
    success(`Domain access: ${domainResponse.domain.name} (${domainResponse.domain.state})`);
    
    if (domainResponse.domain.state !== 'active') {
      warning('Domain is not active - this may cause delivery issues');
    }
    
    return true;
  } catch (err) {
    error(`Mailgun test failed: ${err.message}`);
    return false;
  }
}

async function testEmailSending() {
  info('Testing email sending...');
  
  try {
    const formData = require('form-data');
    const Mailgun = require('mailgun.js');
  } catch (err) {
    warning('Mailgun dependencies not available, skipping email sending test');
    return;
  }
  
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const fromEmail = process.env.MAILGUN_FROM_EMAIL;
  const testEmail = process.env.TEST_EMAIL || 'test@example.com';
  
  if (!apiKey || !domain || !fromEmail) {
    error('Mailgun configuration incomplete - skipping email test');
    return;
  }
  
  try {
    const formData = require('form-data');
    const Mailgun = require('mailgun.js');
    const mailgun = new Mailgun(formData);
    const mg = mailgun.client({
      username: 'api',
      key: apiKey,
    });

    const messageData = {
      from: fromEmail,
      to: testEmail,
      subject: 'BASA System Test - ' + new Date().toISOString(),
      html: `
        <h1>BASA System Test</h1>
        <p>This is a test email from the BASA system.</p>
        <p>Sent at: ${new Date().toISOString()}</p>
        <p>Domain: ${domain}</p>
        <p>From: ${fromEmail}</p>
      `
    };

    const response = await mg.messages.create(domain, messageData);
    success(`Test email sent: ${response.id} to ${testEmail}`);
    
  } catch (err) {
    error(`Email sending failed: ${err.message}`);
  }
}

async function testBASAEmailSystem() {
  info('Testing BASA email system...');
  
  const testData = {
    welcome: {
      email: process.env.TEST_EMAIL || 'test@example.com',
      firstName: 'Test',
      activationUrl: 'https://app.businessassociationsa.com/api/auth/activate?token=test123&email=test@example.com'
    }
  };
  
  try {
    // Test email preview
    const previewParams = new URLSearchParams({
      template: 'welcome',
      ...testData.welcome
    });
    
    const previewResponse = await makeRequest(`http://localhost:3000/api/dev/email-preview?${previewParams}`);
    if (previewResponse.ok) {
      success('Email preview generation: OK');
    } else {
      error('Email preview generation: Failed');
    }
    
    // Test email sending
    const emailResponse = await makeRequest('http://localhost:3000/api/dev/test-email');
    if (emailResponse.ok) {
      success('BASA email API: OK');
    } else {
      error('BASA email API: Failed');
    }
    
  } catch (err) {
    error(`BASA email system test failed: ${err.message}`);
  }
}

// Main execution
async function runTests() {
  const args = process.argv.slice(2);
  const testType = args[0] || 'all';
  
  log('🚀 Starting BASA System Tests...', 'cyan');
  
  try {
    switch (testType) {
      case 'health':
        await testHealthEndpoints();
        break;
      case 'api':
        await testAPIEndpoints();
        break;
      case 'db':
        await checkDatabase();
        break;
      case 'email':
        await testMailgunConfiguration();
        await testEmailSending();
        await testBASAEmailSystem();
        break;
      case 'all':
      default:
        await testHealthEndpoints();
        await testAPIEndpoints();
        await checkDatabase();
        await testMailgunConfiguration();
        await testEmailSending();
        await testBASAEmailSystem();
        break;
    }
    
    success('All tests completed!');
    
  } catch (err) {
    error(`Test execution failed: ${err.message}`);
  }
}

// Show usage if help requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
BASA System Testing Script

Usage: node scripts/test-system.js [test-type]

Test Types:
  health    - Test health endpoints only
  api       - Test API endpoints only
  db        - Check database state only
  email     - Test email system only
  all       - Run all tests (default)

Examples:
  node scripts/test-system.js
  node scripts/test-system.js health
  node scripts/test-system.js email
`);
  process.exit(0);
}

// Run the tests
runTests().catch(console.error); 