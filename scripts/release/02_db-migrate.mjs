#!/usr/bin/env node

import { execSync } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');
const projectRoot = join(__dirname, '../..');

console.log('🗄️  Running database migrations...\n');

try {
  // Change to project root
  process.chdir(projectRoot);
  
  // Check if Prisma is available
  try {
    execSync('npx prisma --version', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ Prisma CLI not found. Please install dependencies first:');
    console.error('   pnpm install');
    process.exit(1);
  }
  
  // Generate Prisma client first
  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated\n');
  
  // Run migrations
  console.log('🚀 Running database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Migrations completed\n');
  
  // Show current migration status
  console.log('📊 Current migration status:');
  try {
    const statusOutput = execSync('npx prisma migrate status', { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    console.log(statusOutput);
  } catch (error) {
    console.log('Migration status command failed, but migrations were successful');
  }
  
  // Show database info
  console.log('\n📋 Database information:');
  try {
    const dbInfo = execSync('npx prisma db pull --print', { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    // Extract useful info
    const lines = dbInfo.split('\n');
    const modelCount = lines.filter(line => line.startsWith('model ')).length;
    const enumCount = lines.filter(line => line.startsWith('enum ')).length;
    
    console.log(`   Models: ${modelCount}`);
    console.log(`   Enums: ${enumCount}`);
    console.log(`   Schema: ${join(projectRoot, 'prisma/schema.prisma')}`);
  } catch (error) {
    console.log('   Could not fetch database schema info');
  }
  
  console.log('\n✅ Database migration script completed successfully!');
  
} catch (error) {
  console.error('\n❌ Database migration failed:');
  console.error(error.message);
  
  if (error.message.includes('DATABASE_URL')) {
    console.error('\n💡 Make sure DATABASE_URL is set in your environment');
    console.error('   Check .env.local or run 01_check-env.mjs first');
  }
  
  if (error.message.includes('connection')) {
    console.error('\n💡 Check your database connection:');
    console.error('   - Database is running');
    console.error('   - DATABASE_URL is correct');
    console.error('   - Network/firewall allows connection');
  }
  
  process.exit(1);
}
