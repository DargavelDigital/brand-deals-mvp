#!/usr/bin/env node

/**
 * CI script to check for any remaining process.env usage in src/**
 * This ensures all environment variable access goes through the env module
 * 
 * Note: NEXT_PUBLIC_ variables are intentionally accessible on the client
 * and should remain as process.env.NEXT_PUBLIC_*
 */

import { execSync } from 'child_process';
import { exit } from 'process';

console.log('🔍 Checking for process.env usage in src/**...');
console.log('   (excluding NEXT_PUBLIC_ variables which are client-safe)');

try {
  // Use grep to search for process.env in src/** files
  // -r: recursive
  // -n: show line numbers
  // -l: only show filenames (not the actual lines)
  // Exclude NEXT_PUBLIC_ variables since those are intentionally client-accessible
  const result = execSync('grep -rnl "process\\.env\\.[^N]" src/ | grep -v "NEXT_PUBLIC"', { 
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  if (result.trim()) {
    console.error('❌ Found process.env usage in the following files:');
    console.error(result);
    console.error('\n🚨 All environment variable access should use the env module (@/lib/env)');
    console.error('   - Use env.VARIABLE_NAME instead of process.env.VARIABLE_NAME');
    console.error('   - Use flag(env.FEATURE_FLAG) for boolean values');
    console.error('   - Never import env.ts from client components');
    console.error('   - NEXT_PUBLIC_ variables can remain as process.env.NEXT_PUBLIC_*');
    exit(1);
  }

  console.log('✅ No unauthorized process.env usage found in src/**');
  console.log('   (NEXT_PUBLIC_ variables are correctly using process.env)');
  exit(0);

} catch (error) {
  // grep exits with code 1 when no matches found (which is good)
  if (error.status === 1) {
    console.log('✅ No unauthorized process.env usage found in src/**');
    console.log('   (NEXT_PUBLIC_ variables are correctly using process.env)');
    exit(0);
  }
  
  // Other errors
  console.error('❌ Error running grep check:', error.message);
  exit(1);
}
