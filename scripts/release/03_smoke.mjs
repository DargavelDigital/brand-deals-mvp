#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

// Load environment variables
function loadEnv() {
  try {
    const envPath = join(__dirname, '../../.env.local');
    const envContent = readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    return envVars;
  } catch (error) {
    return process.env;
  }
}

// Test configuration
const TESTS = [
  {
    name: 'Health Check',
    url: '/api/health',
    expectedStatus: 200,
    expectedBody: (body) => body.ok === true && body.hasOwnProperty('time'),
    description: 'Basic health endpoint with ok: true and time'
  },
  {
    name: 'Contacts API (Unauthenticated)',
    url: '/api/contacts',
    expectedStatus: [400, 401], // Accept both 400 (missing params) and 401 (auth)
    expectedBody: (body) => true, // Any response body is acceptable
    description: 'Should return 400/401, not 500, when not authenticated'
  },
  {
    name: 'Billing Summary',
    url: '/api/billing/summary',
    expectedStatus: 200,
    expectedBody: (body) => body.hasOwnProperty('ok') && typeof body.ok === 'boolean',
    description: 'Should return 200 with ok: true/false, never 500'
  }
];

async function testEndpoint(baseUrl, test) {
  const fullUrl = `${baseUrl}${test.url}`;
  console.log(`\n🧪 Testing: ${test.name}`);
  console.log(`   URL: ${fullUrl}`);
  console.log(`   Expected: ${Array.isArray(test.expectedStatus) ? test.expectedStatus.join(' or ') : test.expectedStatus} ${test.description}`);
  
  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Release-Smoke-Test/1.0'
      }
    });
    
    const status = response.status;
    let body = null;
    
    try {
      body = await response.json();
    } catch (e) {
      body = { raw: await response.text() };
    }
    
    // Check status (handle array of acceptable statuses)
    const expectedStatuses = Array.isArray(test.expectedStatus) ? test.expectedStatus : [test.expectedStatus];
    if (expectedStatuses.includes(status)) {
      console.log(`   ✅ Status: ${status} (expected)`);
    } else {
      console.log(`   ❌ Status: ${status} (expected ${expectedStatuses.join(' or ')})`);
      return false;
    }
    
    // Check body if validation function exists
    if (test.expectedBody && body) {
      try {
        if (test.expectedBody(body)) {
          console.log(`   ✅ Body validation passed`);
        } else {
          console.log(`   ❌ Body validation failed`);
          console.log(`      Received:`, JSON.stringify(body, null, 2));
          return false;
        }
      } catch (e) {
        console.log(`   ⚠️  Body validation error: ${e.message}`);
        return false;
      }
    }
    
    return true;
    
  } catch (error) {
    console.log(`   ❌ Request failed: ${error.message}`);
    return false;
  }
}

async function runSmokeTests() {
  const env = loadEnv();
  const baseUrl = env.APP_URL || env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  console.log('🚀 Running smoke tests...');
  console.log(`📍 Base URL: ${baseUrl}`);
  console.log(`🔍 Environment: ${env.NODE_ENV || 'development'}`);
  
  let passed = 0;
  let failed = 0;
  
  for (const test of TESTS) {
    const success = await testEndpoint(baseUrl, test);
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }
  
  // Summary
  console.log('\n📊 Smoke Test Results:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${Math.round((passed / TESTS.length) * 100)}%`);
  
  if (failed > 0) {
    console.log('\n❌ Some tests failed. Please check:');
    console.log('   - Application is running');
    console.log('   - Database is accessible');
    console.log('   - Environment variables are set correctly');
    console.log('   - Run 01_check-env.mjs and 02_db-migrate.mjs first');
    process.exit(1);
  } else {
    console.log('\n✅ All smoke tests passed!');
    console.log('   Application is ready for deployment.');
  }
}

// Main execution
const targetEnv = process.argv[2]?.toUpperCase();
if (!targetEnv || !['STAGING', 'PRODUCTION'].includes(targetEnv)) {
  console.error('Usage: node 03_smoke.mjs [STAGING|PRODUCTION]');
  console.error('Example: node 03_smoke.mjs STAGING');
  process.exit(1);
}

// Set environment for the tests
process.env.NODE_ENV = targetEnv.toLowerCase();

runSmokeTests().catch(error => {
  console.error('\n💥 Smoke test runner failed:', error.message);
  process.exit(1);
});
