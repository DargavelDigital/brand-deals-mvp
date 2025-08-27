#!/usr/bin/env node

/**
 * Netlify Build Script
 * 
 * This script ensures proper database setup for Netlify deployments:
 * - Runs Prisma migrations before building
 * - Generates Prisma client for the deployment platform
 * - Provides clear logging for debugging
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function main() {
  console.log('🚀 Starting Netlify build process...');
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`📊 DATABASE_URL available: ${process.env.DATABASE_URL ? 'Yes' : 'No'}`);
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is required for Netlify build');
    console.log('💡 Please ensure DATABASE_URL is set in your Netlify environment variables');
    process.exit(1);
  }
  
  try {
    // Step 1: Generate Prisma client
    console.log('🔄 Step 1: Generating Prisma client...');
    execSync('npx prisma generate --schema=./prisma/schema.prisma', {
      stdio: 'inherit',
      cwd: join(__dirname, '..'),
      env: {
        ...process.env,
        PRISMA_QUERY_ENGINE_TYPE: 'binary',
        PRISMA_FORCE_DOWNLOAD: '1'
      }
    });
    console.log('✅ Prisma client generated successfully');
    
    // Step 2: Run database migrations
    console.log('🔄 Step 2: Running database migrations...');
    execSync('npx prisma migrate deploy --schema=./prisma/schema.prisma', {
      stdio: 'inherit',
      cwd: join(__dirname, '..'),
      env: process.env
    });
    console.log('✅ Database migrations completed successfully');
    
    // Step 3: Build the Next.js application
    console.log('🔄 Step 3: Building Next.js application...');
    execSync('next build', {
      stdio: 'inherit',
      cwd: join(__dirname, '..'),
      env: process.env
    });
    console.log('✅ Next.js build completed successfully');
    
    console.log('🎉 Netlify build completed successfully!');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    console.log('💡 Check the logs above for specific error details');
    process.exit(1);
  }
}

main();
