#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { glob } from 'glob';
import { relative } from 'node:path';

/**
 * Simple Idempotency Wrapper Codemod
 * 
 * Automatically wraps API route handlers with withIdempotency() for POST/PUT/PATCH/DELETE methods.
 * Uses simple string replacement for better reliability.
 */

// HTTP methods that require idempotency
const UNSAFE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

// Patterns to detect existing idempotency protection
const IDEMPOTENCY_PATTERNS = [
  /import.*withIdempotency.*from/i,
  /from.*idempotency/i,
  /withIdempotency\s*\(/i,
  /\.withIdempotency/i
];

// Routes that should be exempt from idempotency wrapping
const EXEMPT_ROUTES = [
  '/api/health',
  '/api/debug',
  '/api/auth',
  '/api/email/unsubscribe'
];

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const onlyIndex = args.indexOf('--only');
  
  let onlyPatterns = [];
  if (onlyIndex !== -1 && args[onlyIndex + 1]) {
    onlyPatterns = args[onlyIndex + 1].split(',').map(p => p.trim());
  }
  
  return { onlyPatterns };
}

/**
 * Check if a route should be exempt from idempotency wrapping
 */
function isExemptRoute(routePath) {
  return EXEMPT_ROUTES.some(exempt => routePath.includes(exempt));
}

/**
 * Check if a file already has idempotency protection
 */
function hasIdempotencyProtection(content) {
  return IDEMPOTENCY_PATTERNS.some(pattern => pattern.test(content));
}

/**
 * Extract HTTP methods from route file content
 */
function extractHttpMethods(content) {
  const methods = new Set();
  
  // Look for exported function names that match HTTP methods
  const methodRegex = /export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s*\(/gi;
  let match;
  
  while ((match = methodRegex.exec(content)) !== null) {
    methods.add(match[1].toUpperCase());
  }
  
  return Array.from(methods);
}

/**
 * Check if a method is already wrapped with withIdempotency
 */
function isMethodWrapped(content, method) {
  const wrappedPattern = new RegExp(`export\\s+const\\s+${method}\\s*=\\s*withIdempotency\\s*\\(`, 'i');
  return wrappedPattern.test(content);
}

/**
 * Wrap a method with withIdempotency using simple string replacement
 */
function wrapMethod(content, method) {
  // Check if withIdempotency import exists
  const hasImport = /import.*withIdempotency.*from/i.test(content);
  
  // Find the original method function declaration
  const methodRegex = new RegExp(`export\\s+(?:async\\s+)?function\\s+${method}\\s*\\(([^)]*)\\)\\s*{`, 'i');
  const methodMatch = methodRegex.exec(content);
  
  if (!methodMatch) {
    throw new Error(`Could not find ${method} function to wrap`);
  }
  
  const functionParams = methodMatch[1];
  
  // Create the wrapped version
  let newContent = content;
  
  // Add import if missing
  if (!hasImport) {
    const importMatch = content.match(/import\s+{[^}]+}\s+from\s+['"][^'"]+['"];?\s*\n/);
    if (importMatch) {
      // Add after existing imports
      const importIndex = importMatch.index + importMatch[0].length;
      newContent = content.substring(0, importIndex) + 
        `import { withIdempotency } from '@/lib/idempotency';\n` +
        content.substring(importIndex);
    } else {
      // Add at the beginning
      newContent = `import { withIdempotency } from '@/lib/idempotency';\n\n` + content;
    }
  }
  
  // Replace the function declaration with wrapped version
  const originalDeclaration = `export async function ${method}(${functionParams}) {`;
  const wrappedDeclaration = `export const ${method} = withIdempotency(async (${functionParams}) => {`;
  
  newContent = newContent.replace(originalDeclaration, wrappedDeclaration);
  
  // Add closing parenthesis for the withIdempotency call
  // Find the last closing brace of the function and add the closing parenthesis
  const lastBraceIndex = newContent.lastIndexOf('}');
  if (lastBraceIndex !== -1) {
    newContent = newContent.substring(0, lastBraceIndex) + '});' + newContent.substring(lastBraceIndex + 1);
  }
  
  return newContent;
}

/**
 * Process a single route file
 */
function processFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const routePath = filePath.replace('src/app', '').replace('/route.ts', '');
    
    // Skip exempt routes
    if (isExemptRoute(routePath)) {
      return { status: 'skipped', reason: 'exempt route' };
    }
    
    // Check if already has idempotency protection
    if (hasIdempotencyProtection(content)) {
      return { status: 'skipped', reason: 'already protected' };
    }
    
    // Extract HTTP methods
    const methods = extractHttpMethods(content);
    const unsafeMethods = methods.filter(method => UNSAFE_METHODS.includes(method));
    
    // Skip if no unsafe methods
    if (unsafeMethods.length === 0) {
      return { status: 'skipped', reason: 'no unsafe methods' };
    }
    
    // Check which methods need wrapping
    const methodsToWrap = unsafeMethods.filter(method => !isMethodWrapped(content, method));
    
    if (methodsToWrap.length === 0) {
      return { status: 'skipped', reason: 'methods already wrapped' };
    }
    
    // Wrap each method
    let newContent = content;
    for (const method of methodsToWrap) {
      newContent = wrapMethod(newContent, method);
    }
    
    // Write the modified content
    writeFileSync(filePath, newContent, 'utf8');
    
    return { 
      status: 'changed', 
      methodsWrapped: methodsToWrap,
      methods: methods,
      unsafeMethods: unsafeMethods
    };
    
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

/**
 * Main codemod function
 */
async function runCodemod() {
  const { onlyPatterns } = parseArgs();
  
  console.log('🔧 Simple Idempotency Wrapper Codemod');
  console.log('=====================================');
  
  let patterns = ['src/app/api/**/route.ts'];
  if (onlyPatterns.length > 0) {
    patterns = onlyPatterns;
    console.log(`📁 Restricted to patterns: ${patterns.join(', ')}`);
  }
  
  const results = {
    changed: [],
    skipped: [],
    errors: []
  };
  
  try {
    // Find all matching route files
    const allFiles = [];
    for (const pattern of patterns) {
      const files = await glob(pattern, { cwd: process.cwd() });
      allFiles.push(...files);
    }
    
    // Remove duplicates
    const uniqueFiles = [...new Set(allFiles)];
    
    console.log(`📁 Found ${uniqueFiles.length} route files to process`);
    
    // Process each file
    for (const filePath of uniqueFiles) {
      const result = processFile(filePath);
      const relativePath = relative(process.cwd(), filePath);
      
      if (result.status === 'changed') {
        results.changed.push({
          file: relativePath,
          methodsWrapped: result.methodsWrapped,
          methods: result.methods,
          unsafeMethods: result.unsafeMethods
        });
        console.log(`✅ ${relativePath} - wrapped ${result.methodsWrapped.join(', ')}`);
      } else if (result.status === 'skipped') {
        results.skipped.push({
          file: relativePath,
          reason: result.reason
        });
        console.log(`⏭️  ${relativePath} - ${result.reason}`);
      } else if (result.status === 'error') {
        results.errors.push({
          file: relativePath,
          error: result.error
        });
        console.log(`❌ ${relativePath} - ${result.error}`);
      }
    }
    
    // Print summary
    console.log('\n📊 Summary');
    console.log('==========');
    console.log(`✅ Changed: ${results.changed.length} files`);
    console.log(`⏭️  Skipped: ${results.skipped.length} files`);
    console.log(`❌ Errors: ${results.errors.length} files`);
    
    if (results.changed.length > 0) {
      console.log('\n📝 Changed Files:');
      results.changed.forEach(result => {
        console.log(`  - ${result.file}: ${result.methodsWrapped.join(', ')}`);
      });
    }
    
    if (results.errors.length > 0) {
      console.log('\n❌ Errors:');
      results.errors.forEach(result => {
        console.log(`  - ${result.file}: ${result.error}`);
      });
    }
    
    // Exit with error code if there were errors
    if (results.errors.length > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Codemod failed:', error);
    process.exit(1);
  }
}

// Run the codemod
runCodemod().catch(console.error);
