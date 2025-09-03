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
  
  // Validate DATABASE_URL protocol
  if (process.env.DATABASE_URL.startsWith('prisma+postgresql://')) {
    console.error('❌ DATABASE_URL should use postgresql:// protocol, not prisma+postgresql://');
    console.log('💡 Please update DATABASE_URL in Netlify environment variables to use postgresql://');
    process.exit(1);
  }
  
  if (!process.env.DATABASE_URL.startsWith('postgresql://') && !process.env.DATABASE_URL.startsWith('postgres://')) {
    console.error('❌ DATABASE_URL must start with postgresql:// or postgres://');
    console.log('💡 Current DATABASE_URL:', process.env.DATABASE_URL.substring(0, 20) + '...');
    process.exit(1);
  }
  
  try {
    // Step 1: Clean and generate Prisma client
    console.log('🔄 Step 1: Cleaning and generating Prisma client...');
    
    // First, clean any existing Prisma client
    try {
      execSync('rm -rf node_modules/.prisma', { cwd: join(__dirname, '..') });
      console.log('✅ Cleaned existing Prisma client');
    } catch (e) {
      console.log('ℹ️ No existing Prisma client to clean');
    }
    
    // Generate fresh Prisma client with comprehensive logging
    console.log('🔍 Environment check before Prisma generation:');
    const prismaEnv = {
      PRISMA_ACCELERATE: process.env.PRISMA_ACCELERATE || 'NOT_SET',
      PRISMA_DATA_PROXY: process.env.PRISMA_DATA_PROXY || 'NOT_SET',
      PRISMA_QUERY_ENGINE_TYPE: process.env.PRISMA_QUERY_ENGINE_TYPE || 'NOT_SET',
      DATABASE_URL_PROTOCOL: process.env.DATABASE_URL?.substring(0, 20) || 'NOT_SET'
    };
    console.log('📊 Prisma Environment:', JSON.stringify(prismaEnv, null, 2));
    
    const buildEnv = {
      ...process.env,
      PRISMA_QUERY_ENGINE_TYPE: 'binary',
      PRISMA_FORCE_DOWNLOAD: '1',
      // Ensure no Accelerate or Data Proxy flags are set
      PRISMA_ACCELERATE: undefined,
      PRISMA_DATA_PROXY: undefined
    };
    
    execSync('npx prisma generate --schema=./prisma/schema.prisma', {
      stdio: 'inherit',
      cwd: join(__dirname, '..'),
      env: buildEnv
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
