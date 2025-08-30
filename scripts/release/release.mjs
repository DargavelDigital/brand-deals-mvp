#!/usr/bin/env node

import { execSync } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

const RELEASE_STEPS = [
  {
    name: 'Environment Validation',
    script: '01_check-env.mjs',
    description: 'Validate required environment variables'
  },
  {
    name: 'Database Migration',
    script: '02_db-migrate.mjs',
    description: 'Run database migrations and generate Prisma client'
  },
  {
    name: 'Smoke Tests',
    script: '03_smoke.mjs',
    description: 'Validate key API endpoints are working'
  },
  {
    name: 'Cache Warming',
    script: '04_cache-warm.mjs',
    description: 'Prime application cache for better performance'
  }
];

async function runReleaseStep(step, targetEnv, options = {}) {
  const scriptPath = join(__dirname, step.script);
  const args = [targetEnv];
  
  // Add mock flag for cache warming if requested
  if (step.script === '04_cache-warm.mjs' && options.mock) {
    args.push('--mock');
  }
  
  console.log(`\n🚀 Step ${RELEASE_STEPS.indexOf(step) + 1}/${RELEASE_STEPS.length}: ${step.name}`);
  console.log(`   📝 ${step.description}`);
  console.log(`   🔧 Running: node ${step.script} ${args.join(' ')}`);
  
  try {
    execSync(`node ${scriptPath} ${args.join(' ')}`, {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    console.log(`   ✅ ${step.name} completed successfully`);
    return true;
    
  } catch (error) {
    console.error(`   ❌ ${step.name} failed`);
    console.error(`   💥 Error: ${error.message}`);
    
    if (error.status !== undefined) {
      console.error(`   📊 Exit code: ${error.status}`);
    }
    
    return false;
  }
}

async function runFullRelease(targetEnv, options = {}) {
  console.log('🎯 Starting release process...');
  console.log(`📍 Target Environment: ${targetEnv}`);
  console.log(`🔍 Options:`, options);
  console.log(`📁 Scripts directory: ${__dirname}`);
  
  const startTime = Date.now();
  let successfulSteps = 0;
  let failedSteps = 0;
  
  for (const step of RELEASE_STEPS) {
    const success = await runReleaseStep(step, targetEnv, options);
    
    if (success) {
      successfulSteps++;
    } else {
      failedSteps++;
      
      // Ask user if they want to continue
      if (options.interactive !== false) {
        console.log('\n❓ Step failed. Do you want to continue with remaining steps? (y/N)');
        // In a real implementation, you'd read from stdin
        // For now, we'll exit on first failure
        console.log('   Exiting due to step failure. Fix the issue and run again.');
        process.exit(1);
      }
    }
  }
  
  const totalTime = Date.now() - startTime;
  
  // Final summary
  console.log('\n🎉 Release Process Complete!');
  console.log(`📊 Results:`);
  console.log(`   ✅ Successful steps: ${successfulSteps}`);
  console.log(`   ❌ Failed steps: ${failedSteps}`);
  console.log(`   📈 Success rate: ${Math.round((successfulSteps / RELEASE_STEPS.length) * 100)}%`);
  console.log(`   ⏱️  Total time: ${Math.round(totalTime / 1000)}s`);
  
  if (failedSteps === 0) {
    console.log('\n🎯 All release steps completed successfully!');
    console.log(`   Your ${targetEnv.toLowerCase()} environment is ready.`);
    
    if (targetEnv === 'PRODUCTION') {
      console.log('\n⚠️  PRODUCTION DEPLOYMENT COMPLETE');
      console.log('   Monitor your application for any issues.');
      console.log('   Consider running smoke tests again in a few minutes.');
    }
  } else {
    console.log('\n❌ Some release steps failed.');
    console.log('   Please review the errors above and fix them.');
    console.log('   You can run individual steps to retry:');
    RELEASE_STEPS.forEach((step, index) => {
      console.log(`      node ${step.script} ${targetEnv}`);
    });
    
    process.exit(1);
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const targetEnv = args[0]?.toUpperCase();
  
  if (!targetEnv || !['STAGING', 'PRODUCTION'].includes(targetEnv)) {
    console.error('Usage: node release.mjs [STAGING|PRODUCTION] [options]');
    console.error('');
    console.error('Options:');
    console.error('  --mock          Enable mock mode for cache warming');
    console.error('  --non-interactive  Continue on step failures');
    console.error('');
    console.error('Examples:');
    console.error('  node release.mjs STAGING');
    console.error('  node release.mjs PRODUCTION --mock');
    console.error('  node release.mjs STAGING --non-interactive');
    process.exit(1);
  }
  
  const options = {
    mock: args.includes('--mock'),
    interactive: !args.includes('--non-interactive')
  };
  
  return { targetEnv, options };
}

// Main execution
const { targetEnv, options } = parseArgs();

console.log('🎯 Brand Deals MVP Release Runner');
console.log('=====================================');

runFullRelease(targetEnv, options).catch(error => {
  console.error('\n💥 Release runner failed:', error.message);
  process.exit(1);
});
