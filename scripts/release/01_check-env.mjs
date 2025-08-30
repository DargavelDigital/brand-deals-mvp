#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

// Load environment variables from .env files
function loadEnv() {
  // Try multiple env files in order of priority
  const envFiles = ['.env.test', '.env.local', '.env'];
  let envVars = {};
  
  for (const envFile of envFiles) {
    try {
      const envPath = join(__dirname, '../../', envFile);
      const envContent = readFileSync(envPath, 'utf8');
      
      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      });
      
      console.log(`📁 Loaded environment from ${envFile}`);
      break; // Use first successful file
    } catch (error) {
      // Continue to next file
    }
  }
  
  // Merge with process.env (process.env takes precedence)
  return { ...envVars, ...process.env };
}

// Required variables for different environments
const REQUIRED_VARS = {
  STAGING: [
    'DATABASE_URL',
    'APP_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ],
  PRODUCTION: [
    'DATABASE_URL',
    'APP_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ]
};

// Feature flags that should be set
const FEATURE_FLAGS = [
  'FEATURE_OBSERVABILITY',
  'FEATURE_BILLING_ENABLED',
  'FEATURE_DEMO_AUTH'
];

function validateEnvironment(env, targetEnv) {
  console.log(`🔍 Validating environment for ${targetEnv} deployment...\n`);
  
  const required = REQUIRED_VARS[targetEnv] || [];
  const missing = [];
  const warnings = [];
  
  // Check required variables
  required.forEach(varName => {
    if (!env[varName]) {
      missing.push(varName);
    }
  });
  
  // Check feature flags
  FEATURE_FLAGS.forEach(flag => {
    if (!env[flag]) {
      warnings.push(`${flag} not set (will use default)`);
    }
  });
  
  // Check database URL format
  if (env.DATABASE_URL) {
    if (!env.DATABASE_URL.includes('postgresql://')) {
      warnings.push('DATABASE_URL should use postgresql:// protocol');
    }
  }
  
  // Check APP_URL format
  if (env.APP_URL) {
    if (!env.APP_URL.startsWith('https://')) {
      warnings.push('APP_URL should use https:// for production');
    }
  }
  
  // Report results
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\nPlease set these variables before deploying.');
    process.exit(1);
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️  Warnings:');
    warnings.forEach(warning => {
      console.warn(`   - ${warning}`);
    });
  }
  
  console.log('✅ Environment validation passed!');
  console.log(`\nRequired vars: ${required.length} ✓`);
  console.log(`Feature flags: ${FEATURE_FLAGS.length} ✓`);
  
  // Show current values (masked for security)
  console.log('\n📋 Current environment:');
  required.forEach(varName => {
    const value = env[varName];
    if (value) {
      const masked = varName.includes('SECRET') || varName.includes('KEY') 
        ? `${value.substring(0, 8)}...`
        : value;
      console.log(`   ${varName}=${masked}`);
    }
  });
}

// Main execution
const targetEnv = process.argv[2]?.toUpperCase();
if (!targetEnv || !['STAGING', 'PRODUCTION'].includes(targetEnv)) {
  console.error('Usage: node 01_check-env.mjs [STAGING|PRODUCTION]');
  console.error('Example: node 01_check-env.mjs STAGING');
  process.exit(1);
}

const env = loadEnv();
validateEnvironment(env, targetEnv);
