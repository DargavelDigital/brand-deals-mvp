#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { glob } from 'glob';
import { relative } from 'node:path';

/**
 * Missing Idempotency Audit Script
 * 
 * Scans API routes for missing idempotency protection and creates a batched implementation plan.
 */

const API_ROUTES_PATTERN = 'src/app/api/**/route.ts';

// Batch configuration
const BATCH_SIZE = 8;
const BATCH_CATEGORIES = {
  'contacts': ['contacts'],
  'outreach': ['outreach'],
  'brand-run': ['brand-run'],
  'audit': ['audit'],
  'media-pack': ['media-pack', 'mediapack'],
  'misc': [] // Everything else
};

// HTTP methods that require idempotency
const UNSAFE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

// Patterns to detect idempotency protection
const IDEMPOTENCY_PATTERNS = [
  /import.*withIdempotency.*from/i,
  /from.*idempotency/i,
  /withIdempotency\s*\(/i,
  /\.withIdempotency/i
];

// Routes that are known to be protected (hardcoded for Edge Runtime compatibility)
const KNOWN_PROTECTED_ROUTES = [
  '/api/audit/run',
  '/api/outreach/queue', 
  '/api/media-pack/generate'
];

// Routes that should be exempt from idempotency requirements
const EXEMPT_ROUTES = [
  '/api/health',
  '/api/debug',
  '/api/auth',
  '/api/email/unsubscribe'
];

/**
 * Check if a route should be exempt from idempotency requirements
 */
function isExemptRoute(routePath) {
  return EXEMPT_ROUTES.some(exempt => routePath.includes(exempt));
}

/**
 * Check if a route is already protected by idempotency
 */
function isRouteProtected(filePath, content) {
  // Check if file contains idempotency patterns
  const hasIdempotencyPattern = IDEMPOTENCY_PATTERNS.some(pattern => pattern.test(content));
  
  if (hasIdempotencyPattern) {
    return true;
  }
  
  // Check against known protected routes
  const routePath = filePath.replace('src/app', '').replace('/route.ts', '');
  return KNOWN_PROTECTED_ROUTES.includes(routePath);
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
  
  // Also check for method handlers in Next.js App Router format
  const handlerRegex = /export\s*{\s*([^}]+)\s*}/g;
  const handlerMatch = handlerRegex.exec(content);
  if (handlerMatch) {
    const handlers = handlerMatch[1];
    UNSAFE_METHODS.forEach(method => {
      if (handlers.includes(method)) {
        methods.add(method);
      }
    });
  }
  
  return Array.from(methods);
}

/**
 * Categorize a route path for batching
 */
function categorizeRoute(routePath) {
  for (const [category, patterns] of Object.entries(BATCH_CATEGORIES)) {
    if (patterns.some(pattern => routePath.includes(pattern))) {
      return category;
    }
  }
  return 'misc';
}

/**
 * Generate implementation suggestions for a route
 */
function generateImplementationSuggestions(routePath, methods) {
  const suggestions = [];
  
  // Basic idempotency wrapper suggestion
  suggestions.push({
    type: 'wrapper',
    description: 'Wrap handler with withIdempotency()',
    code: `import { withIdempotency } from '@/lib/idempotency';

export const ${methods[0]} = withIdempotency(async (request) => {
  // Your existing handler code here
});`
  });
  
  // Transaction wrapper suggestion if multiple methods
  if (methods.length > 1) {
    suggestions.push({
      type: 'transaction',
      description: 'Use tx() for multi-write operations',
      code: `import { tx } from '@/lib/idempotency';

// Wrap database operations with tx()
const result = await tx(async (prisma) => {
  // Your database operations here
});`
    });
  }
  
  return suggestions;
}

/**
 * Main audit function
 */
async function auditMissingIdempotency() {
  console.log('🔍 Scanning API routes for missing idempotency protection...');
  
  const results = {
    timestamp: new Date().toISOString(),
    summary: {
      totalRoutes: 0,
      protectedRoutes: 0,
      missingIdempotency: 0,
      exemptRoutes: 0
    },
    routes: [],
    batches: []
  };
  
  try {
    // Find all API route files
    const routeFiles = await glob(API_ROUTES_PATTERN, { cwd: process.cwd() });
    results.summary.totalRoutes = routeFiles.length;
    
    console.log(`📁 Found ${routeFiles.length} API route files`);
    
    // Process each route file
    for (const filePath of routeFiles) {
      try {
        const content = readFileSync(filePath, 'utf8');
        const routePath = filePath.replace('src/app', '').replace('/route.ts', '');
        
        // Skip exempt routes
        if (isExemptRoute(routePath)) {
          results.summary.exemptRoutes++;
          continue;
        }
        
        // Extract HTTP methods
        const methods = extractHttpMethods(content);
        const unsafeMethods = methods.filter(method => UNSAFE_METHODS.includes(method));
        
        // Skip if no unsafe methods
        if (unsafeMethods.length === 0) {
          continue;
        }
        
        // Check if route is protected
        const isProtected = isRouteProtected(filePath, content);
        
        const routeInfo = {
          path: routePath,
          file: filePath,
          methods: methods,
          unsafeMethods: unsafeMethods,
          protected: isProtected,
          category: categorizeRoute(routePath),
          suggestions: isProtected ? [] : generateImplementationSuggestions(routePath, unsafeMethods)
        };
        
        results.routes.push(routeInfo);
        
        if (isProtected) {
          results.summary.protectedRoutes++;
        } else {
          results.summary.missingIdempotency++;
        }
        
      } catch (error) {
        console.warn(`⚠️  Error processing ${filePath}:`, error.message);
      }
    }
    
    // Create batches
    const routesByCategory = {};
    results.routes.forEach(route => {
      if (!route.protected) {
        const category = route.category;
        if (!routesByCategory[category]) {
          routesByCategory[category] = [];
        }
        routesByCategory[category].push(route);
      }
    });
    
    // Generate batches
    let batchNumber = 1;
    for (const [category, routes] of Object.entries(routesByCategory)) {
      for (let i = 0; i < routes.length; i += BATCH_SIZE) {
        const batchRoutes = routes.slice(i, i + BATCH_SIZE);
        const batch = {
          number: batchNumber++,
          category: category,
          routes: batchRoutes.map(route => ({
            path: route.path,
            methods: route.methods,
            unsafeMethods: route.unsafeMethods,
            file: route.file,
            suggestions: route.suggestions
          })),
          estimatedEffort: batchRoutes.length <= 3 ? 'Low' : batchRoutes.length <= 6 ? 'Medium' : 'High'
        };
        results.batches.push(batch);
      }
    }
    
    // Write JSON output
    writeFileSync('docs/audit/missing-idempotency.json', JSON.stringify(results, null, 2));
    
    // Generate markdown plan
    const markdownContent = generateMarkdownPlan(results);
    writeFileSync('docs/audit/missing-idempotency.plan.md', markdownContent);
    
    console.log('✅ Missing idempotency audit complete');
    console.log(`📄 JSON: docs/audit/missing-idempotency.json`);
    console.log(`📄 Plan: docs/audit/missing-idempotency.plan.md`);
    console.log(`📊 Summary: ${results.summary.missingIdempotency} routes need idempotency protection`);
    
  } catch (error) {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  }
}

/**
 * Generate markdown implementation plan
 */
function generateMarkdownPlan(results) {
  const { summary, batches } = results;
  
  let content = `# Missing Idempotency Implementation Plan

Generated: ${results.timestamp}

## Summary

- **Total Routes**: ${summary.totalRoutes}
- **Protected Routes**: ${summary.protectedRoutes}
- **Missing Idempotency**: ${summary.missingIdempotency}
- **Exempt Routes**: ${summary.exemptRoutes}
- **Batches**: ${batches.length}

## Implementation Strategy

This plan groups routes into small batches (max ${BATCH_SIZE} routes) for easy review and merging. Each batch focuses on a specific domain to minimize conflicts.

### Batch Categories

`;

  // Add category descriptions
  for (const [category, patterns] of Object.entries(BATCH_CATEGORIES)) {
    const patternList = patterns.length > 0 ? patterns.join(', ') : 'All other routes';
    content += `- **${category.toUpperCase()}**: ${patternList}\n`;
  }

  content += `\n## Implementation Batches\n\n`;

  // Add each batch
  batches.forEach(batch => {
    content += `### Batch ${batch.number}: ${batch.category.toUpperCase()} (${batch.routes.length} routes) - ${batch.estimatedEffort} Effort\n\n`;
    
    batch.routes.forEach(route => {
      content += `#### ${route.path}\n`;
      content += `- **File**: \`${route.file}\`\n`;
      content += `- **Methods**: ${route.methods ? route.methods.join(', ') : 'None'}\n`;
      content += `- **Unsafe Methods**: ${route.unsafeMethods ? route.unsafeMethods.join(', ') : 'None'}\n\n`;
      
      if (route.suggestions.length > 0) {
        content += `**Implementation Suggestions:**\n\n`;
        route.suggestions.forEach((suggestion, index) => {
          content += `${index + 1}. **${suggestion.description}**\n`;
          content += `\`\`\`typescript\n${suggestion.code}\n\`\`\`\n\n`;
        });
      }
    });
    
    content += `---\n\n`;
  });

  content += `## Implementation Checklist

For each batch:

- [ ] Review the routes and their current implementation
- [ ] Add \`withIdempotency\` wrapper to route handlers
- [ ] Use \`tx()\` for multi-write operations
- [ ] Test idempotency behavior (duplicate requests return same result)
- [ ] Update middleware allowlist if needed
- [ ] Create PR with batch changes
- [ ] Mark batch as complete in this plan

## Notes

- Routes are grouped by domain to minimize merge conflicts
- Each batch should be small enough for easy review
- Test idempotency by making duplicate requests with the same \`Idempotency-Key\`
- Consider adding route-specific allowlist entries for routes that legitimately don't need idempotency
`;

  return content;
}

// Run the audit
auditMissingIdempotency().catch(console.error);
