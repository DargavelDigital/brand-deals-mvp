#!/usr/bin/env node

// Test environment variable loading
console.log('🔧 Environment Variables Test');
console.log('=============================');

// Check if dotenv is available
try {
  const dotenv = await import('dotenv');
  console.log('✅ dotenv available');
  
  // Load .env files
  dotenv.config();
  console.log('✅ .env loaded');
  
  // Load .env.local
  dotenv.config({ path: '.env.local' });
  console.log('✅ .env.local loaded');
  
} catch (error) {
  console.log('❌ dotenv not available:', error.message);
}

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log('AI_ADAPT_FEEDBACK:', process.env.AI_ADAPT_FEEDBACK);
console.log('DEV_DEMO_AUTH:', process.env.DEV_DEMO_AUTH);
console.log('NEXT_PUBLIC_DEV_DEMO_AUTH:', process.env.NEXT_PUBLIC_DEV_DEMO_AUTH);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

// Check if we're in Next.js context
console.log('\n🔍 Context:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Current working directory:', process.cwd());
console.log('Files in current directory:', require('fs').readdirSync('.').filter(f => f.startsWith('.env')));
