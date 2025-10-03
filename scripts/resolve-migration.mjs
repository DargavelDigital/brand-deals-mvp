#!/usr/bin/env node

// Script to resolve failed Prisma migrations
// This marks the failed migration as resolved so new migrations can be applied

import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resolveFailedMigration() {
  try {
    console.log('🔧 Resolving failed migration...');
    
    // Mark the failed migration as resolved
    execSync('npx prisma migrate resolve --applied 20250103102000_add_mediapack_payload', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
    });
    
    console.log('✅ Failed migration marked as resolved');
    
    // Now run the actual migrations
    console.log('🚀 Running migrations...');
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
    });
    
    console.log('✅ All migrations applied successfully');
    
  } catch (error) {
    console.error('❌ Error resolving migration:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resolveFailedMigration();
