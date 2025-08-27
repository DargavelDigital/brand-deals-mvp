#!/usr/bin/env node

/**
 * Prisma Generate Script
 * 
 * This script handles Prisma client generation and migrations gracefully:
 * - If DATABASE_URL is available, generates the client and runs migrations
 * - If not available (e.g., during Netlify build), skips gracefully
 * - Provides clear logging for debugging
 * - Ensures cross-platform compatibility for deployment
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function main() {
  const hasDatabaseUrl = process.env.DATABASE_URL;
  const isNetlify = process.env.NETLIFY === 'true';
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.log('🔍 Checking Prisma environment...');
  console.log(`📊 DATABASE_URL available: ${hasDatabaseUrl ? 'Yes' : 'No'}`);
  console.log(`🌐 Environment: ${isNetlify ? 'Netlify' : 'Local'}`);
  console.log(`🏗️  Build type: ${isProduction ? 'Production' : 'Development'}`);
  
  // Always generate on Netlify to ensure cross-platform compatibility
  if (!hasDatabaseUrl && !isNetlify) {
    console.log('⚠️  Skipping Prisma generate - DATABASE_URL not available');
    console.log('💡 This is normal during build time in serverless environments');
    console.log('🚀 Prisma client will be generated at runtime when DATABASE_URL is available');
    return;
  }
  
  try {
    console.log('🔄 Generating Prisma client...');
    
    // Use npx to ensure we have access to the prisma command
    const generateCommand = 'npx prisma generate --schema=./prisma/schema.prisma';
    console.log(`📝 Running: ${generateCommand}`);
    
    execSync(generateCommand, { 
      stdio: 'inherit',
      cwd: join(__dirname, '..'),
      env: {
        ...process.env,
        // Ensure we generate for the target platform
        PRISMA_QUERY_ENGINE_TYPE: 'binary',
        // Force binary download for deployment platform
        PRISMA_FORCE_DOWNLOAD: '1'
      }
    });
    
    console.log('✅ Prisma client generated successfully');
    
    // Run migrations if DATABASE_URL is available
    if (hasDatabaseUrl) {
      console.log('🔄 Running database migrations...');
      
      try {
        const migrateCommand = 'npx prisma migrate deploy --schema=./prisma/schema.prisma';
        console.log(`📝 Running: ${migrateCommand}`);
        
        execSync(migrateCommand, { 
          stdio: 'inherit',
          cwd: join(__dirname, '..'),
          env: process.env
        });
        
        console.log('✅ Database migrations completed successfully');
      } catch (migrateError) {
        console.error('❌ Failed to run migrations:', migrateError.message);
        console.log('💡 This may cause runtime errors if the schema is out of sync');
        
        if (isNetlify) {
          console.log('🚨 Migration failure on Netlify - build will continue but may fail at runtime');
        }
      }
    } else {
      console.log('⚠️  Skipping migrations - DATABASE_URL not available');
    }
    
    // Additional verification for Netlify deployments
    if (isNetlify) {
      console.log('🔍 Verifying Prisma client for Netlify deployment...');
      
      try {
        // Check if the generated client exists
        const fs = require('fs');
        const clientPath = join(__dirname, '../node_modules/.prisma/client');
        
        if (fs.existsSync(clientPath)) {
          const files = fs.readdirSync(clientPath);
          const hasQueryEngine = files.some(file => file.includes('query_engine'));
          console.log(`📦 Prisma client files: ${files.length} files found`);
          console.log(`🔧 Query engine binary: ${hasQueryEngine ? 'Found' : 'Missing'}`);
          
          if (!hasQueryEngine) {
            console.warn('⚠️  Query engine binary not found - this may cause runtime issues');
            console.log('💡 This usually means the binary targets are not properly configured');
          }
        }
      } catch (error) {
        console.warn('⚠️  Could not verify Prisma client structure:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to generate Prisma client:', error.message);
    
    if (isNetlify) {
      console.log('💡 This is a critical error for Netlify deployment');
      console.log('🚨 Build will fail - please check Prisma configuration');
      process.exit(1); // Fail the build on Netlify
    } else {
      console.log('💡 Continuing build process...');
      process.exit(0); // Don't fail local builds
    }
  }
}

main();
