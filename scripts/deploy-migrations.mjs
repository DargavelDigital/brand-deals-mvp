#!/usr/bin/env node

// Script to deploy Prisma migrations with error handling
// This can be run manually to resolve migration issues

import { execSync } from 'child_process';

async function deployMigrations() {
  try {
    console.log('🔧 Deploying Prisma migrations...');
    
    // First, try to resolve any failed migrations
    try {
      execSync('npx prisma migrate resolve --applied 20250103102000_add_mediapack_payload', {
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
      });
      console.log('✅ Resolved failed migration');
    } catch (error) {
      console.log('ℹ️  No failed migration to resolve or already resolved');
    }
    
    // Now deploy migrations
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
    });
    
    console.log('✅ Migrations deployed successfully');
    
  } catch (error) {
    console.error('❌ Error deploying migrations:', error.message);
    process.exit(1);
  }
}

deployMigrations();
