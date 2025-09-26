#!/usr/bin/env node

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, relative } from 'path';

const errors = [];
const results = {
  timestamp: new Date().toISOString(),
  steps: {
    start: { components: [], apiRoutes: [], services: [], models: [], flags: [], jobs: [] },
    connect: { components: [], apiRoutes: [], services: [], models: [], flags: [], jobs: [] },
    audit: { components: [], apiRoutes: [], services: [], models: [], flags: [], jobs: [] },
    match: { components: [], apiRoutes: [], services: [], models: [], flags: [], jobs: [] },
    approve: { components: [], apiRoutes: [], services: [], models: [], flags: [], jobs: [] },
    pack: { components: [], apiRoutes: [], services: [], models: [], flags: [], jobs: [] },
    contacts: { components: [], apiRoutes: [], services: [], models: [], flags: [], jobs: [] },
    outreach: { components: [], apiRoutes: [], services: [], models: [], flags: [], jobs: [] },
    send: { components: [], apiRoutes: [], services: [], models: [], flags: [], jobs: [] }
  },
  errors: []
};

// Helper to find files with limited scope
function findFilesLimited(dir, pattern, maxFiles = 100) {
  const files = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (files.length >= maxFiles) break;
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...findFilesLimited(fullPath, pattern, maxFiles - files.length));
      } else if (pattern.test(entry.name)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    errors.push(`Error reading directory ${dir}: ${error.message}`);
  }
  return files;
}

// Simple extraction without heavy processing
function extractBrandRunInfo(content, filePath) {
  const info = {
    components: [],
    apiRoutes: [],
    services: [],
    models: [],
    flags: [],
    jobs: []
  };
  
  // Simple pattern matching
  if (content.includes('brand') || content.includes('Brand')) {
    // Look for basic patterns
    const componentMatch = content.match(/export\s+(?:const|function)\s+(\w+)/);
    if (componentMatch) {
      info.components.push({
        name: componentMatch[1],
        file: relative('src', filePath),
        line: 1
      });
    }
    
    const apiMatch = content.match(/export\s+(?:const|function)\s+(GET|POST|PUT|DELETE|PATCH)/);
    if (apiMatch) {
      info.apiRoutes.push({
        name: apiMatch[1],
        file: relative('src', filePath),
        line: 1
      });
    }
  }
  
  return info;
}

// Scan limited files
console.log('🔍 Scanning for Brand Run related files (limited scope)...');
const brandRunFiles = findFilesLimited('src', /\.(ts|tsx)$/, 50);

for (const filePath of brandRunFiles) {
  try {
    const content = readFileSync(filePath, 'utf8');
    
    if (content.match(/brand.*run|brandrun/i)) {
      const info = extractBrandRunInfo(content, filePath);
      
      // Add to all steps for now (simplified)
      Object.keys(results.steps).forEach(stepName => {
        results.steps[stepName].components.push(...info.components);
        results.steps[stepName].apiRoutes.push(...info.apiRoutes);
        results.steps[stepName].services.push(...info.services);
        results.steps[stepName].models.push(...info.models);
        results.steps[stepName].flags.push(...info.flags);
        results.steps[stepName].jobs.push(...info.jobs);
      });
    }
  } catch (error) {
    errors.push(`Error reading ${filePath}: ${error.message}`);
  }
}

// Add errors to results
results.errors = errors;

// Write outputs
import { writeFileSync } from 'fs';

// Write JSON output
writeFileSync('docs/audit/brandrun-trace.json', JSON.stringify(results, null, 2));

// Write Markdown output
const mdContent = `# Brand Run Trace Report (Simplified)

Generated: ${results.timestamp}

## Brand Run Steps

${Object.entries(results.steps).map(([stepName, stepData]) => `
### ${stepName.charAt(0).toUpperCase() + stepName.slice(1)} (${stepName})
- **Components**: ${stepData.components.length}
- **API Routes**: ${stepData.apiRoutes.length}
- **Services**: ${stepData.services.length}
- **Models**: ${stepData.models.length}
- **Flags**: ${stepData.flags.length}
- **Jobs**: ${stepData.jobs.length}
`).join('\n')}

## Summary
- **Total Steps**: ${Object.keys(results.steps).length}
- **Total Components**: ${Object.values(results.steps).reduce((sum, step) => sum + step.components.length, 0)}
- **Total API Routes**: ${Object.values(results.steps).reduce((sum, step) => sum + step.apiRoutes.length, 0)}
- **Total Services**: ${Object.values(results.steps).reduce((sum, step) => sum + step.services.length, 0)}
- **Total Models**: ${Object.values(results.steps).reduce((sum, step) => sum + step.models.length, 0)}
- **Total Flags**: ${Object.values(results.steps).reduce((sum, step) => sum + step.flags.length, 0)}
- **Total Jobs**: ${Object.values(results.steps).reduce((sum, step) => sum + step.jobs.length, 0)}

**Note**: This is a simplified version due to memory constraints. For full analysis, run individual scripts.

${errors.length > 0 ? `
## Errors
${errors.map(error => `- ❌ ${error}`).join('\n')}
` : ''}
`;

writeFileSync('docs/audit/brandrun-trace.md', mdContent);

console.log('✅ Brand Run trace complete (simplified)');
console.log(`📄 JSON: docs/audit/brandrun-trace.json`);
console.log(`📄 Markdown: docs/audit/brandrun-trace.md`);
