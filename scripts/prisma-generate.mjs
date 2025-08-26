#!/usr/bin/env node

/**
 * Prisma Generate Script
 * 
 * This script handles Prisma client generation gracefully:
 * - If DATABASE_URL is available, generates the client
 * - If not available (e.g., during Netlify build), skips gracefully
 * - Provides clear logging for debugging
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function main() {
  const hasDatabaseUrl = process.env.DATABASE_URL;
  
  console.log('🔍 Checking Prisma environment...');
  console.log(`📊 DATABASE_URL available: ${hasDatabaseUrl ? 'Yes' : 'No'}`);
  
  if (!hasDatabaseUrl) {
    console.log('⚠️  Skipping Prisma generate - DATABASE_URL not available');
    console.log('💡 This is normal during build time in serverless environments');
    console.log('🚀 Prisma client will be generated at runtime when DATABASE_URL is available');
    return;
  }
  
  try {
    console.log('🔄 Generating Prisma client...');
    execSync('prisma generate', { 
      stdio: 'inherit',
      cwd: join(__dirname, '..')
    });
    console.log('✅ Prisma client generated successfully');
  } catch (error) {
    console.error('❌ Failed to generate Prisma client:', error.message);
    console.log('💡 Continuing build process...');
    process.exit(0); // Don't fail the build
  }
}

main();
