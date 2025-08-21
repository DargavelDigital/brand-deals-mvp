#!/usr/bin/env node

import { execSync } from 'child_process';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const BANNED_PATTERNS = [
  'border-dashed',
  'outline-dashed',
  'w-screen',
  'max-w-full',
  'min-w-full',
  'flex-1',
  'grow',
  'basis-full'
];

function findTsxFiles(dir, files = []) {
  const items = readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = join(dir, item.name);
    
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
      findTsxFiles(fullPath, files);
    } else if (item.name.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function checkFileForBannedPatterns(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const violations = [];
  
  BANNED_PATTERNS.forEach(pattern => {
    const regex = new RegExp(pattern, 'g');
    const matches = content.match(regex);
    
    if (matches) {
      violations.push({
        pattern,
        count: matches.length,
        file: filePath
      });
    }
  });
  
  return violations;
}

console.log('🔍 Running UI Design System Guard Check...\n');

try {
  // Step 1: Run ESLint
  console.log('📋 Running ESLint with UI guard rules...');
  execSync('pnpm lint:ui', { stdio: 'inherit' });
  console.log('✅ ESLint passed\n');
} catch (error) {
  console.error('❌ ESLint failed with UI guard violations');
  process.exit(1);
}

// Step 2: Double-check with grep for banned patterns
console.log('🔍 Double-checking for banned patterns in TSX files...');

const appDir = join(process.cwd(), 'src/app');
const componentsDir = join(process.cwd(), 'src/components');

let allViolations = [];

// Check app directory
if (appDir) {
  const appFiles = findTsxFiles(appDir);
  appFiles.forEach(file => {
    const violations = checkFileForBannedPatterns(file);
    allViolations.push(...violations);
  });
}

// Check components directory
if (componentsDir) {
  const componentFiles = findTsxFiles(componentsDir);
  componentFiles.forEach(file => {
    const violations = checkFileForBannedPatterns(file);
    allViolations.push(...violations);
  });
}

if (allViolations.length > 0) {
  console.error('❌ Found banned patterns in TSX files:');
  allViolations.forEach(violation => {
    console.error(`   ${violation.pattern} (${violation.count}x) in ${violation.file}`);
  });
  console.error('\n🚫 These patterns violate the design system. Please fix them.');
  process.exit(1);
}

console.log('✅ No banned patterns found in TSX files');
console.log('\n🎉 UI Design System Guard Check passed!');
console.log('   All components follow the design system guidelines.');
