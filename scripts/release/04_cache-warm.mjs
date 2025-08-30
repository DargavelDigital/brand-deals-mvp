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

// Endpoints to warm up
const CACHE_ENDPOINTS = [
  {
    name: 'Latest Audit',
    url: '/api/audit/latest',
    method: 'GET',
    description: 'Prime audit cache for faster initial loads'
  },
  {
    name: 'Top Matches',
    url: '/api/match/top',
    method: 'GET',
    description: 'Prime match cache for faster initial loads'
  }
];

// Helper function to add delay between requests
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function warmEndpoint(baseUrl, endpoint, useMock = false) {
  const fullUrl = `${baseUrl}${endpoint.url}`;
  const headers = {
    'User-Agent': 'Release-Cache-Warm/1.0'
  };
  
  // Add mock flag if requested
  if (useMock) {
    headers['X-FLAG-USE-MOCK'] = '1';
  }
  
  console.log(`\n🔥 Warming: ${endpoint.name}`);
  console.log(`   URL: ${fullUrl}`);
  console.log(`   Method: ${endpoint.method}`);
  console.log(`   Mock: ${useMock ? 'Yes' : 'No'}`);
  
  try {
    const startTime = Date.now();
    const response = await fetch(fullUrl, {
      method: endpoint.method,
      headers
    });
    
    const duration = Date.now() - startTime;
    const status = response.status;
    
    if (status >= 200 && status < 300) {
      console.log(`   ✅ Success: ${status} (${duration}ms)`);
      
      // Try to get response size
      try {
        const body = await response.text();
        const sizeKB = (body.length / 1024).toFixed(1);
        console.log(`   📊 Response size: ${sizeKB}KB`);
      } catch (e) {
        console.log(`   📊 Response size: unknown`);
      }
      
      return { success: true, duration, status };
    } else if (status === 401) {
      console.log(`   ⚠️  Unauthorized: ${status} (expected for unauthenticated requests)`);
      return { success: true, duration, status };
    } else {
      console.log(`   ❌ Failed: ${status} (${duration}ms)`);
      return { success: false, duration, status };
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, duration: 0, error: error.message };
  }
}

async function warmCache() {
  const env = loadEnv();
  const baseUrl = env.APP_URL || env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const useMock = process.argv.includes('--mock') || process.argv.includes('-m');
  
  console.log('🔥 Warming up application cache...');
  console.log(`📍 Base URL: ${baseUrl}`);
  console.log(`🔍 Environment: ${env.NODE_ENV || 'development'}`);
  console.log(`🎭 Mock mode: ${useMock ? 'Enabled' : 'Disabled'}`);
  
  if (useMock) {
    console.log('\n💡 Mock mode enabled - will set FLAG_USE_MOCK=1 for cache warming');
  }
  
  let successful = 0;
  let failed = 0;
  let totalDuration = 0;
  
  for (const endpoint of CACHE_ENDPOINTS) {
    const result = await warmEndpoint(baseUrl, endpoint, useMock);
    
    if (result.success) {
      successful++;
      totalDuration += result.duration;
    } else {
      failed++;
    }
    
    // Add delay between requests to avoid overwhelming the server
    if (endpoint !== CACHE_ENDPOINTS[CACHE_ENDPOINTS.length - 1]) {
      await delay(1000); // 1 second delay
    }
  }
  
  // Summary
  console.log('\n📊 Cache Warming Results:');
  console.log(`   ✅ Successful: ${successful}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${Math.round((successful / CACHE_ENDPOINTS.length) * 100)}%`);
  
  if (successful > 0) {
    const avgDuration = Math.round(totalDuration / successful);
    console.log(`   ⏱️  Average response time: ${avgDuration}ms`);
  }
  
  if (failed > 0) {
    console.log('\n⚠️  Some endpoints failed to warm up. This might be expected if:');
    console.log('   - Application is not fully deployed yet');
    console.log('   - Some features are disabled');
    console.log('   - Authentication is required');
    
    if (failed === CACHE_ENDPOINTS.length) {
      console.log('\n❌ All cache warming failed. Check if application is running.');
      process.exit(1);
    }
  }
  
  console.log('\n✅ Cache warming completed!');
  console.log('   Application should respond faster to initial requests.');
}

// Main execution
const targetEnv = process.argv[2]?.toUpperCase();
if (!targetEnv || !['STAGING', 'PRODUCTION'].includes(targetEnv)) {
  console.error('Usage: node 04_cache-warm.mjs [STAGING|PRODUCTION] [--mock]');
  console.error('Example: node 04_cache-warm.mjs STAGING');
  console.error('Example: node 04_cache-warm.mjs PRODUCTION --mock');
  process.exit(1);
}

// Set environment for the script
process.env.NODE_ENV = targetEnv.toLowerCase();

warmCache().catch(error => {
  console.error('\n💥 Cache warming failed:', error.message);
  process.exit(1);
});
