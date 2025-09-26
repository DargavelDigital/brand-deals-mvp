#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const errors = [];
const results = {
  timestamp: new Date().toISOString(),
  pages: [],
  apiRoutes: [],
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

// Helper to extract HTTP methods from route file
function extractHttpMethods(content) {
  const methods = [];
  const methodRegex = /export\s+(?:const\s+)?(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s*=/g;
  let match;
  while ((match = methodRegex.exec(content)) !== null) {
    methods.push(match[1]);
  }
  return methods;
}

// Helper to check for auth usage
function checkAuth(content) {
  const authPatterns = [
    /getServerSession/,
    /middleware/,
    /auth/,
    /session/,
    /NextAuth/
  ];
  
  const hasAuth = authPatterns.some(pattern => pattern.test(content));
  return hasAuth ? 'required' : 'none';
}

// Helper to find external API calls
function findExternalCalls(content) {
  const externalCalls = [];
  
  // Check for fetch calls to external origins
  const fetchRegex = /fetch\s*\(\s*['"`](https?:\/\/[^'"`]+)['"`]/g;
  let match;
  while ((match = fetchRegex.exec(content)) !== null) {
    const url = match[1];
    if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
      externalCalls.push(url);
    }
  }
  
  // Check for specific service imports/usage
  const services = ['openai', 'stripe', '@sendgrid', 'resend', 'hunter', 'exa'];
  for (const service of services) {
    if (content.includes(service)) {
      externalCalls.push(`Service: ${service}`);
    }
  }
  
  return [...new Set(externalCalls)];
}

// Helper to find Prisma writes
function findPrismaWrites(content) {
  const writes = [];
  const prismaWriteRegex = /prisma\.\w+\.(create|update|delete|upsert|\$transaction)/g;
  let match;
  while ((match = prismaWriteRegex.exec(content)) !== null) {
    writes.push(match[0]);
  }
  return [...new Set(writes)];
}

// Helper to extract runtime config
function extractRuntime(content) {
  const runtimeMatch = content.match(/export\s+const\s+runtime\s*=\s*['"`]([^'"`]+)['"`]/);
  return runtimeMatch ? runtimeMatch[1] : 'nodejs';
}

// Process page files
console.log('🔍 Scanning page files...');
const pageFiles = findFiles('src/app', /^page\.(tsx|ts)$/);

for (const filePath of pageFiles) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const relativePath = relative('src', filePath);
    
    results.pages.push({
      path: relativePath,
      hasAuth: checkAuth(content),
      externalCalls: findExternalCalls(content),
      prismaWrites: findPrismaWrites(content)
    });
  } catch (error) {
    errors.push(`Error reading ${filePath}: ${error.message}`);
  }
}

// Process API route files
console.log('🔍 Scanning API route files...');
const apiFiles = findFiles('src/app', /^route\.(ts|tsx)$/);

for (const filePath of apiFiles) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const relativePath = relative('src', filePath);
    
    results.apiRoutes.push({
      path: relativePath,
      methods: extractHttpMethods(content),
      runtime: extractRuntime(content),
      auth: checkAuth(content),
      externalCalls: findExternalCalls(content),
      prismaWrites: findPrismaWrites(content)
    });
  } catch (error) {
    errors.push(`Error reading ${filePath}: ${error.message}`);
  }
}

// Add errors to results
results.errors = errors;

// Write outputs
import { writeFileSync } from 'fs';

// Write JSON output
writeFileSync('docs/audit/inventory-routes.json', JSON.stringify(results, null, 2));

// Write Markdown output
const mdContent = `# Route Inventory Report

Generated: ${results.timestamp}

## Pages (${results.pages.length})
${results.pages.map(page => `
### ${page.path}
- **Auth**: ${page.auth === 'required' ? '🔒 Required' : '🔓 None'}
- **External Calls**: ${page.externalCalls.length > 0 ? page.externalCalls.map(call => `\`${call}\``).join(', ') : 'None'}
- **Prisma Writes**: ${page.prismaWrites.length > 0 ? page.prismaWrites.map(write => `\`${write}\``).join(', ') : 'None'}
`).join('\n')}

## API Routes (${results.apiRoutes.length})
${results.apiRoutes.map(route => `
### ${route.path}
- **Methods**: ${route.methods.length > 0 ? route.methods.map(m => `\`${m}\``).join(', ') : 'None detected'}
- **Runtime**: \`${route.runtime}\`
- **Auth**: ${route.auth === 'required' ? '🔒 Required' : '🔓 None'}
- **External Calls**: ${route.externalCalls.length > 0 ? route.externalCalls.map(call => `\`${call}\``).join(', ') : 'None'}
- **Prisma Writes**: ${route.prismaWrites.length > 0 ? route.prismaWrites.map(write => `\`${write}\``).join(', ') : 'None'}
`).join('\n')}

## Summary
- **Total Pages**: ${results.pages.length}
- **Total API Routes**: ${results.apiRoutes.length}
- **Pages with Auth**: ${results.pages.filter(p => p.auth === 'required').length}
- **API Routes with Auth**: ${results.apiRoutes.filter(r => r.auth === 'required').length}
- **Routes with External Calls**: ${[...results.pages, ...results.apiRoutes].filter(r => r.externalCalls.length > 0).length}
- **Routes with Prisma Writes**: ${[...results.pages, ...results.apiRoutes].filter(r => r.prismaWrites.length > 0).length}

${errors.length > 0 ? `
## Errors
${errors.map(error => `- ❌ ${error}`).join('\n')}
` : ''}
`;

writeFileSync('docs/audit/inventory-routes.md', mdContent);

console.log('✅ Route inventory complete');
console.log(`📄 JSON: docs/audit/inventory-routes.json`);
console.log(`📄 Markdown: docs/audit/inventory-routes.md`);
