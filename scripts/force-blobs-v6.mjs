#!/usr/bin/env node

// Force Netlify to use @netlify/blobs v6 by explicitly checking and installing
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

console.log('🔧 Forcing @netlify/blobs v6 installation...');

try {
  // Check current version
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  const currentVersion = packageJson.dependencies['@netlify/blobs'];
  
  console.log(`Current version: ${currentVersion}`);
  
  if (!currentVersion || !currentVersion.includes('6')) {
    console.log('❌ Not using v6, forcing installation...');
    execSync('pnpm add @netlify/blobs@^6.5.0', { stdio: 'inherit' });
  } else {
    console.log('✅ Already using v6+');
  }
  
  // Verify the installation
  const { execSync } = await import('child_process');
  const result = execSync('pnpm list @netlify/blobs --depth=0', { encoding: 'utf8' });
  console.log('📦 Installed version:', result);
  
  console.log('✅ Blobs v6 forced successfully');
} catch (error) {
  console.error('❌ Failed to force Blobs v6:', error.message);
  process.exit(1);
}
