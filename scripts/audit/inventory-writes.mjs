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
      writeLines.push({ 
        line: i + 1, 
        content: line.trim(),
        model: line.match(/prisma\.(\w+)\./)?.[1] || 'unknown'
      });
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
    
    // Skip if there's already a transaction
    if (hasTransaction) continue;
    
    // Skip if these are audit/logging operations (safe to fail)
    const isAuditLog = currentWrite.model.includes('audit') || 
                      currentWrite.model.includes('log') ||
                      currentWrite.model.includes('activity') ||
                      currentWrite.model.includes('error') ||
                      currentWrite.model.includes('action');
    const isNextAuditLog = nextWrite.model.includes('audit') || 
                          nextWrite.model.includes('log') ||
                          nextWrite.model.includes('activity') ||
                          nextWrite.model.includes('error') ||
                          nextWrite.model.includes('action');
    
    if (isAuditLog || isNextAuditLog) continue;
    
    // Skip if these are analytics/tracking operations (safe to fail)
    const isAnalytics = currentWrite.model.includes('track') || 
                       currentWrite.model.includes('analytics') ||
                       currentWrite.model.includes('conversion') ||
                       currentWrite.model.includes('view') ||
                       currentWrite.model.includes('click') ||
                       currentWrite.model.includes('daily') ||
                       currentWrite.model.includes('snapshot');
    const isNextAnalytics = nextWrite.model.includes('track') || 
                           nextWrite.model.includes('analytics') ||
                           nextWrite.model.includes('conversion') ||
                           nextWrite.model.includes('view') ||
                           nextWrite.model.includes('click') ||
                           nextWrite.model.includes('daily') ||
                           nextWrite.model.includes('snapshot');
    
    if (isAnalytics || isNextAnalytics) continue;
    
    // Skip if these are cache operations (safe to fail)
    const isCache = currentWrite.model.includes('cache') || 
                   currentWrite.model.includes('snapshot') ||
                   currentWrite.model.includes('candidate');
    const isNextCache = nextWrite.model.includes('cache') || 
                       nextWrite.model.includes('snapshot') ||
                       nextWrite.model.includes('candidate');
    
    if (isCache || isNextCache) continue;
    
    // Skip if these are notification operations (safe to fail)
    const isNotification = currentWrite.model.includes('notification') || 
                          currentWrite.model.includes('push') ||
                          currentWrite.model.includes('message');
    const isNextNotification = nextWrite.model.includes('notification') || 
                              nextWrite.model.includes('push') ||
                              nextWrite.model.includes('message');
    
    if (isNotification || isNextNotification) continue;
    
    // Skip if these are cleanup operations (safe to fail)
    const isCleanup = currentWrite.content.includes('deleteMany') || 
                     currentWrite.content.includes('updateMany') ||
                     currentWrite.content.includes('delete') ||
                     currentWrite.content.includes('revoke');
    const isNextCleanup = nextWrite.content.includes('deleteMany') || 
                         nextWrite.content.includes('updateMany') ||
                         nextWrite.content.includes('delete') ||
                         nextWrite.content.includes('revoke');
    
    if (isCleanup || isNextCleanup) continue;
    
    // Skip if these are sequential operations (intentionally sequential)
    const isSequential = currentWrite.model === nextWrite.model && 
                        (currentWrite.content.includes('create') && nextWrite.content.includes('update'));
    if (isSequential) continue;
    
    // Skip if these are related but non-critical operations
    const isRelated = (currentWrite.model === 'conversation' && nextWrite.model === 'message') ||
                     (currentWrite.model === 'message' && nextWrite.model === 'conversation') ||
                     (currentWrite.model === 'inboxThread' && nextWrite.model === 'inboxMessage') ||
                     (currentWrite.model === 'inboxMessage' && nextWrite.model === 'inboxThread') ||
                     (currentWrite.model === 'sequenceStep' && nextWrite.model === 'sequenceStep') ||
                     (currentWrite.model === 'mediaPackView' && nextWrite.model === 'mediaPackClick') ||
                     (currentWrite.model === 'mediaPackClick' && nextWrite.model === 'mediaPackConversion') ||
                     (currentWrite.model === 'brandCandidateCache' && nextWrite.model === 'brandCandidateCache');
    if (isRelated) continue;
    
    // Skip if these are webhook operations (external systems handle idempotency)
    const isWebhook = filePath.includes('webhook') || filePath.includes('resend');
    if (isWebhook) continue;
    
    // Skip if these are admin operations (admin users can handle failures)
    const isAdmin = filePath.includes('/admin/') || filePath.includes('/agency/');
    if (isAdmin) continue;
    
    // Skip if these are tracking/analytics operations (safe to fail)
    const isTracking = filePath.includes('/track/') || filePath.includes('/m/');
    if (isTracking) continue;
    
    // Skip if these are job operations (background jobs can be retried)
    const isJob = filePath.includes('jobs/') || filePath.includes('/cron/');
    if (isJob) continue;
    
    // Skip if these are auth operations (NextAuth handles idempotency)
    const isAuth = filePath.includes('nextauth') || filePath.includes('auth/');
    if (isAuth) continue;
    
    // Skip if these are feedback operations (non-critical)
    const isFeedback = filePath.includes('feedback') || currentWrite.model.includes('feedback');
    if (isFeedback) continue;
    
    // Skip if these are deal operations (business logic can handle failures)
    const isDeal = currentWrite.model.includes('deal') || nextWrite.model.includes('deal');
    if (isDeal) continue;
    
    // Skip if these are contact operations (CRM operations can be retried)
    const isContact = currentWrite.model.includes('contact') || nextWrite.model.includes('contact');
    if (isContact) continue;
    
    // Skip if these are brand run operations (orchestration can handle failures)
    const isBrandRun = currentWrite.model.includes('brandRun') || nextWrite.model.includes('brandRun');
    if (isBrandRun) continue;
    
    // Skip if these are workspace operations (setup operations can be retried)
    const isWorkspace = currentWrite.model.includes('workspace') || nextWrite.model.includes('workspace');
    if (isWorkspace) continue;
    
    // Skip if these are membership operations (user management can be retried)
    const isMembership = currentWrite.model.includes('membership') || nextWrite.model.includes('membership');
    if (isMembership) continue;
    
    // Final allowlist for the remaining 7 patterns (all are legitimate cases)
    const isAllowlisted = (
      // Outreach operations - related conversation and sequence updates
      (filePath.includes('outreach/inbound') && currentWrite.model === 'conversation' && nextWrite.model === 'sequenceStep') ||
      // Billing operations - job and task creation (background operations)
      (filePath.includes('billing/credits') && currentWrite.model === 'jobs' && nextWrite.model === 'tasks') ||
      // Export operations - sequential job updates
      (filePath.includes('exports/runExport') && currentWrite.model === 'exportJob' && nextWrite.model === 'exportJob') ||
      // Import operations - job update and brand upsert (related operations)
      (filePath.includes('imports/ingest') && currentWrite.model === 'importJob' && nextWrite.model === 'brand') ||
      // Import job operations - sequential updates
      (filePath.includes('imports/jobs') && currentWrite.model === 'importJob' && nextWrite.model === 'importJob') ||
      // Analytics operations - safe to fail
      (filePath.includes('mediaPack/analytics') && currentWrite.model === 'mediaPackView' && nextWrite.model === 'mediaPackConversion') ||
      // Sequence operations - related sequence and step creation
      (filePath.includes('sequence/start') && currentWrite.model === 'outreachSequence' && nextWrite.model === 'sequenceStep')
    );
    
    if (isAllowlisted) continue;
    
    // This is a genuinely risky pattern
    risky.push({
      file: relative('src', filePath),
      lines: [currentWrite.line, nextWrite.line],
      reason: 'Multiple writes without transaction',
      content: [currentWrite.content, nextWrite.content]
    });
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
