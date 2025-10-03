#!/usr/bin/env node

// Script to apply the current Prisma schema to the database
// This will create the missing tables and columns

import { execSync } from 'child_process';

async function applySchema() {
  try {
    console.log('🔧 Applying Prisma schema to database...');
    
    // First, reset the database to match the schema
    console.log('📋 Resetting database...');
    execSync('npx prisma db push --force-reset', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
    });
    
    console.log('✅ Database schema applied successfully');
    
  } catch (error) {
    console.error('❌ Error applying schema:', error.message);
    process.exit(1);
  }
}

applySchema();
