#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

console.log('🔧 Database Connection Test');
console.log('============================');

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.local' });

console.log('\n📋 Environment Variables:');
console.log('DATABASE_URL:', process.env.DATABASE_URL);

console.log('\n🔍 Testing Prisma Connection...');

const prisma = new PrismaClient();

try {
  // Test connection
  await prisma.$connect();
  console.log('✅ Prisma connected successfully!');
  
  // Test a simple query
  const result = await prisma.$queryRaw`SELECT 1 as test`;
  console.log('✅ Database query successful:', result);
  
  await prisma.$disconnect();
  console.log('✅ Prisma disconnected successfully!');
  
} catch (error) {
  console.error('❌ Database connection failed:');
  console.error('Error:', error.message);
  console.error('Code:', error.code);
  
  if (error.code === 'P1010') {
    console.log('\n💡 This is a P1010 error - user denied access');
    console.log('Possible causes:');
    console.log('1. Wrong username/password in DATABASE_URL');
    console.log('2. Database user lacks permissions');
    console.log('3. Database doesn\'t exist');
  }
}
