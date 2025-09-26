#!/usr/bin/env node

import { readFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';

const errors = [];
const results = {
  timestamp: new Date().toISOString(),
  byModel: {},
  risky: [],
  idempotency: [],
  errors: []
};

// Helper to recursively find files
function findFiles(dir, pattern) {
  const files = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...findFiles(fullPath, pattern));
      } else if (pattern.test(entry.name)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    errors.push(`Error reading directory ${dir}: ${error.message}`);
  }
  return files;
}

// Helper to find enclosing route for a file
function findEnclosingRoute(filePath) {
  const parts = filePath.split('/');
  const appIndex = parts.indexOf('app');
  if (appIndex === -1) return null;
  
  const routeParts = parts.slice(appIndex + 1);
  const routePath = '/' + routeParts.join('/').replace(/\/page\.(tsx|ts)$/, '').replace(/\/route\.(ts|tsx)$/, '');
  return routePath === '/' ? '/' : routePath;
}

// Helper to extract Prisma model operations
function extractPrismaOperations(content, filePath) {
  const operations = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Find prisma.model.operation patterns
    const prismaMatch = line.match(/prisma\.(\w+)\.(create|update|delete|upsert|\$transaction)/);
    if (prismaMatch) {
      const [, model, operation] = prismaMatch;
      const route = findEnclosingRoute(filePath);
      
      operations.push({
        model,
        operation,
        line: i + 1,
        content: line.trim(),
        file: relative('src', filePath),
        route
      });
    }
  }
  
  return operations;
}

// Helper to detect risky write patterns
function detectRiskyPatterns(content, filePath) {
  const risky = [];
  const lines = content.split('\n');
  
  // Look for sequences of 2+ writes without $transaction
  const writeLines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/prisma\.\w+\.(create|update|delete|upsert)/)) {
      writeLines.push({ line: i + 1, content: line.trim() });
    }
  }
  
  // Check for sequences without $transaction
  for (let i = 0; i < writeLines.length - 1; i++) {
    const currentWrite = writeLines[i];
    const nextWrite = writeLines[i + 1];
    
    // Check if there's a $transaction between them
    const hasTransaction = lines.slice(currentWrite.line - 1, nextWrite.line).some(line => 
      line.includes('$transaction')
    );
    
    if (!hasTransaction) {
      risky.push({
        file: relative('src', filePath),
        lines: [currentWrite.line, nextWrite.line],
        reason: 'Multiple writes without transaction',
        content: [currentWrite.content, nextWrite.content]
      });
    }
  }
  
  return risky;
}

// Helper to check for idempotency patterns
function checkIdempotency(content, filePath) {
  const idempotency = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for idempotency key headers
    if (line.match(/Idempotency-Key|idempotency/i)) {
      idempotency.push({
        file: relative('src', filePath),
        line: i + 1,
        content: line.trim(),
        type: 'header'
      });
    }
    
    // Check for unique token checks
    if (line.match(/unique.*token|token.*unique/i)) {
      idempotency.push({
        file: relative('src', filePath),
        line: i + 1,
        content: line.trim(),
        type: 'token_check'
      });
    }
  }
  
  return idempotency;
}

// Process all source files
console.log('🔍 Scanning source files for Prisma operations...');
const sourceFiles = findFiles('src', /\.(ts|tsx)$/);

for (const filePath of sourceFiles) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const operations = extractPrismaOperations(content, filePath);
    const risky = detectRiskyPatterns(content, filePath);
    const idempotency = checkIdempotency(content, filePath);
    
    // Group operations by model
    for (const op of operations) {
      if (!results.byModel[op.model]) {
        results.byModel[op.model] = [];
      }
      results.byModel[op.model].push({
        file: op.file,
        line: op.line,
        operation: op.operation,
        route: op.route,
        content: op.content
      });
    }
    
    // Add risky patterns
    results.risky.push(...risky);
    
    // Add idempotency patterns
    results.idempotency.push(...idempotency);
    
  } catch (error) {
    errors.push(`Error reading ${filePath}: ${error.message}`);
  }
}

// Analyze write patterns
console.log('🔍 Analyzing write patterns...');

// Find routes with multiple model writes
const routeWrites = {};
for (const [model, operations] of Object.entries(results.byModel)) {
  for (const op of operations) {
    if (op.route) {
      if (!routeWrites[op.route]) {
        routeWrites[op.route] = new Set();
      }
      routeWrites[op.route].add(model);
    }
  }
}

const multiModelRoutes = Object.entries(routeWrites)
  .filter(([, models]) => models.size > 1)
  .map(([route, models]) => ({
    route,
    models: Array.from(models),
    risk: 'Multiple models in single route'
  }));

results.multiModelRoutes = multiModelRoutes;

// Find missing idempotency - only flag routes that actually need it
const writeRoutes = new Set();
const routeMethods = new Map(); // Track HTTP methods for each route

for (const operations of Object.values(results.byModel)) {
  for (const op of operations) {
    if (op.route && ['create', 'update', 'upsert'].includes(op.operation)) {
      // Only flag if it's a write operation in a route that needs idempotency
      if (op.file && op.file.includes('/route.ts')) {
        // This is an API route - check if it needs idempotency
        writeRoutes.add(op.route);
        
        // Try to determine HTTP method from the file
        if (!routeMethods.has(op.route)) {
          try {
            // Try both with and without src/ prefix
            const filePaths = [op.file, `src/${op.file}`];
            let content = null;
            
            for (const filePath of filePaths) {
              try {
                content = readFileSync(filePath, 'utf8');
                break;
              } catch (error) {
                // Try next path
              }
            }
            
            if (!content) {
              console.log(`⚠️  Could not read file: ${op.file} (tried ${filePaths.join(', ')})`);
              routeMethods.set(op.route, { needsIdempotency: true });
              continue;
            }
            const hasPost = /export\s+(async\s+)?function\s+POST|export\s+const\s+POST/.test(content);
            const hasPut = /export\s+(async\s+)?function\s+PUT|export\s+const\s+PUT/.test(content);
            const hasPatch = /export\s+(async\s+)?function\s+PATCH|export\s+const\s+PATCH/.test(content);
            const hasDelete = /export\s+(async\s+)?function\s+DELETE|export\s+const\s+DELETE/.test(content);
            const hasGet = /export\s+(async\s+)?function\s+GET|export\s+const\s+GET/.test(content);
            
            const methods = {
              hasPost, hasPut, hasPatch, hasDelete, hasGet,
              needsIdempotency: hasPost || hasPut || hasPatch || hasDelete
            };
            
            routeMethods.set(op.route, methods);
          } catch (error) {
            // If we can't read the file, assume it needs idempotency
            routeMethods.set(op.route, { needsIdempotency: true });
          }
        }
      }
    }
  }
}

const idempotencyRoutes = new Set();
for (const idem of results.idempotency) {
  // Try to find the route for this file
  const filePath = idem.file;
  const routeMatch = filePath.match(/app\/(.+?)(?:\/page|\/route)/);
  if (routeMatch) {
    idempotencyRoutes.add('/' + routeMatch[1]);
  }
}

// Check for withIdempotency wrapper usage
const protectedRoutes = new Set();
const fileContents = new Map();

// First, collect all file contents
let filesRead = 0;
for (const operations of Object.values(results.byModel)) {
  for (const op of operations) {
    if (op.file && !fileContents.has(op.file)) {
      // Try both with and without src/ prefix
      const filePaths = [op.file, `src/${op.file}`];
      let content = null;
      
      for (const filePath of filePaths) {
        try {
          content = readFileSync(filePath, 'utf8');
          fileContents.set(op.file, content);
          filesRead++;
          break;
        } catch (error) {
          // Try next path
        }
      }
      
      if (!content) {
        console.log(`⚠️  Could not read file: ${op.file} (tried ${filePaths.join(', ')})`);
      }
    }
  }
}
console.log(`🔍 Read ${filesRead} files for withIdempotency detection`);

// Then check for withIdempotency in the full file content
let debugCount = 0;
for (const operations of Object.values(results.byModel)) {
  for (const op of operations) {
    if (op.route && op.file) {
      const content = fileContents.get(op.file);
      if (content && content.includes('withIdempotency')) {
        protectedRoutes.add(op.route);
        debugCount++;
      }
    }
  }
}

console.log(`🔍 Found ${debugCount} routes with withIdempotency protection`);
console.log(`🔍 Protected routes: ${Array.from(protectedRoutes).join(', ')}`);

// Create a set of all routes that have write operations
const allWriteRoutes = new Set();
for (const operations of Object.values(results.byModel)) {
  for (const op of operations) {
    if (op.route && ['create', 'update', 'upsert'].includes(op.operation)) {
      allWriteRoutes.add(op.route);
      
      // Ensure route methods are detected for all routes
      if (op.file && op.file.includes('/route.ts') && !routeMethods.has(op.route)) {
        try {
          // Try both with and without src/ prefix
          const filePaths = [op.file, `src/${op.file}`];
          let content = null;
          
          for (const filePath of filePaths) {
            try {
              content = readFileSync(filePath, 'utf8');
              break;
            } catch (error) {
              // Try next path
            }
          }
          
          if (content) {
            const hasPost = /export\s+(async\s+)?function\s+POST|export\s+const\s+POST/.test(content);
            const hasPut = /export\s+(async\s+)?function\s+PUT|export\s+const\s+PUT/.test(content);
            const hasPatch = /export\s+(async\s+)?function\s+PATCH|export\s+const\s+PATCH/.test(content);
            const hasDelete = /export\s+(async\s+)?function\s+DELETE|export\s+const\s+DELETE/.test(content);
            const hasGet = /export\s+(async\s+)?function\s+GET|export\s+const\s+GET/.test(content);
            
            const methods = {
              hasPost, hasPut, hasPatch, hasDelete, hasGet,
              needsIdempotency: hasPost || hasPut || hasPatch || hasDelete
            };
            
            routeMethods.set(op.route, methods);
          }
        } catch (error) {
          // If we can't read the file, assume it needs idempotency
          routeMethods.set(op.route, { needsIdempotency: true });
        }
      }
    }
  }
}

// Filter out routes that don't need idempotency (GET-only, admin-only, webhooks, etc.)
const missingIdempotency = Array.from(allWriteRoutes)
  .filter(route => {
    // Skip if already protected
    if (idempotencyRoutes.has(route) || protectedRoutes.has(route)) {
      return false;
    }
    
    // Skip if it's a page component (not an API route)
    if (!route.startsWith('/api/')) {
      return false;
    }
    
    // Skip if it's a GET-only route
    const methods = routeMethods.get(route);
    if (methods && !methods.needsIdempotency) {
      return false;
    }
    
    // Skip if it only has GET method (even if it has write operations for analytics)
    if (methods && methods.hasGet && !methods.hasPost && !methods.hasPut && !methods.hasPatch && !methods.hasDelete) {
      return false;
    }
    
    // Skip admin-only tools that might be intentionally not idempotent
    if (route.includes('/admin/') && !route.includes('/api/admin/')) return false;
    
    // Skip webhook routes that might have their own idempotency
    if (route.includes('/webhook')) return false;
    
    return true;
  })
  .map(route => ({
    route,
    risk: 'Write operations without idempotency protection'
  }));

results.missingIdempotency = missingIdempotency;
results.protectedRoutes = Array.from(protectedRoutes);

// Add errors to results
results.errors = errors;

// Write outputs
import { writeFileSync } from 'fs';

// Write JSON output
writeFileSync('docs/audit/inventory-writes.json', JSON.stringify(results, null, 2));

// Write Markdown output
const mdContent = `# Write Operations Inventory Report

Generated: ${results.timestamp}

## Prisma Operations by Model
${Object.entries(results.byModel).map(([model, operations]) => `
### ${model} (${operations.length} operations)
${operations.map(op => `- **${op.operation}** in \`${op.file}:${op.line}\` (${op.route || 'no route'})
  \`\`\`typescript
  ${op.content}
  \`\`\`
`).join('\n')}
`).join('\n')}

## Risky Write Patterns (${results.risky.length})
${results.risky.map(risk => `
### ${risk.file}:${risk.lines.join('-')}
**Issue**: ${risk.reason}
\`\`\`typescript
${risk.content.join('\n')}
\`\`\`
`).join('\n')}

## Multi-Model Routes (${results.multiModelRoutes.length})
${results.multiModelRoutes.map(route => `
### ${route.route}
**Models**: ${route.models.join(', ')}
**Risk**: ${route.risk}
`).join('\n')}

## Idempotency Analysis
### Found Idempotency Patterns (${results.idempotency.length})
${results.idempotency.map(idem => `
- **${idem.type}** in \`${idem.file}:${idem.line}\`
  \`\`\`typescript
  ${idem.content}
  \`\`\`
`).join('\n')}

### Missing Idempotency (${results.missingIdempotency.length})
${results.missingIdempotency.map(route => `
- **${route.route}**: ${route.risk}
`).join('\n')}

## Summary
- **Total Models with Writes**: ${Object.keys(results.byModel).length}
- **Total Write Operations**: ${Object.values(results.byModel).reduce((sum, ops) => sum + ops.length, 0)}
- **Risky Patterns**: ${results.risky.length}
- **Multi-Model Routes**: ${results.multiModelRoutes.length}
- **Idempotency Patterns Found**: ${results.idempotency.length}
- **Routes Missing Idempotency**: ${results.missingIdempotency.length}

${errors.length > 0 ? `
## Errors
${errors.map(error => `- ❌ ${error}`).join('\n')}
` : ''}
`;

writeFileSync('docs/audit/inventory-writes.md', mdContent);

console.log('✅ Write operations inventory complete');
console.log(`📄 JSON: docs/audit/inventory-writes.json`);
console.log(`📄 Markdown: docs/audit/inventory-writes.md`);
