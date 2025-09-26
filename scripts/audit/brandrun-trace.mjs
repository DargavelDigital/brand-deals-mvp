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

// Helper to extract Brand Run step information
function extractBrandRunStep(content, filePath) {
  const steps = [];
  const lines = content.split('\n');
  
  // Look for Brand Run step patterns
  const stepPatterns = [
    { name: 'start', pattern: /brand.*run.*start|start.*brand.*run/i },
    { name: 'connect', pattern: /brand.*run.*connect|connect.*brand.*run/i },
    { name: 'audit', pattern: /brand.*run.*audit|audit.*brand.*run/i },
    { name: 'match', pattern: /brand.*run.*match|match.*brand.*run/i },
    { name: 'approve', pattern: /brand.*run.*approve|approve.*brand.*run/i },
    { name: 'pack', pattern: /brand.*run.*pack|pack.*brand.*run/i },
    { name: 'contacts', pattern: /brand.*run.*contacts|contacts.*brand.*run/i },
    { name: 'outreach', pattern: /brand.*run.*outreach|outreach.*brand.*run/i },
    { name: 'send', pattern: /brand.*run.*send|send.*brand.*run/i }
  ];
  
  for (const step of stepPatterns) {
    if (step.pattern.test(content)) {
      const lineNum = content.search(step.pattern);
      const line = content.substring(0, lineNum).split('\n').length;
      
      steps.push({
        name: step.name,
        file: relative('src', filePath),
        line: line,
        type: 'step'
      });
    }
  }
  
  return steps;
}

// Helper to extract components
function extractComponents(content, filePath) {
  const components = [];
  const lines = content.split('\n');
  
  // Look for component patterns
  const componentPatterns = [
    { name: 'React Component', pattern: /export\s+(?:const|function)\s+(\w+)\s*[=:]\s*(?:\(|function)/i },
    { name: 'Page Component', pattern: /export\s+default\s+function\s+(\w+)/i },
    { name: 'API Route', pattern: /export\s+(?:const|function)\s+(GET|POST|PUT|DELETE|PATCH)/i }
  ];
  
  for (const component of componentPatterns) {
    const matches = content.match(component.pattern);
    if (matches) {
      const lineNum = content.search(component.pattern);
      const line = content.substring(0, lineNum).split('\n').length;
      
      components.push({
        name: matches[1] || matches[0],
        file: relative('src', filePath),
        line: line,
        type: component.name
      });
    }
  }
  
  return components;
}

// Helper to extract API routes
function extractAPIRoutes(content, filePath) {
  const routes = [];
  const lines = content.split('\n');
  
  // Look for API route patterns
  const routePatterns = [
    { name: 'API Route', pattern: /export\s+(?:const|function)\s+(GET|POST|PUT|DELETE|PATCH)/i },
    { name: 'Route Handler', pattern: /export\s+(?:const|function)\s+(\w*[Hh]andler\w*)/i }
  ];
  
  for (const route of routePatterns) {
    const matches = content.match(route.pattern);
    if (matches) {
      const lineNum = content.search(route.pattern);
      const line = content.substring(0, lineNum).split('\n').length;
      
      routes.push({
        name: matches[1] || matches[0],
        file: relative('src', filePath),
        line: line,
        type: route.name
      });
    }
  }
  
  return routes;
}

// Helper to extract services
function extractServices(content, filePath) {
  const services = [];
  const lines = content.split('\n');
  
  // Look for service patterns
  const servicePatterns = [
    { name: 'Service Function', pattern: /export\s+(?:const|function)\s+(\w*[Ss]ervice\w*)/i },
    { name: 'Service Class', pattern: /export\s+class\s+(\w*[Ss]ervice\w*)/i },
    { name: 'Service Method', pattern: /export\s+(?:const|function)\s+(\w*[Ss]ervice\w*)/i }
  ];
  
  for (const service of servicePatterns) {
    const matches = content.match(service.pattern);
    if (matches) {
      const lineNum = content.search(service.pattern);
      const line = content.substring(0, lineNum).split('\n').length;
      
      services.push({
        name: matches[1],
        file: relative('src', filePath),
        line: line,
        type: service.name
      });
    }
  }
  
  return services;
}

// Helper to extract models
function extractModels(content, filePath) {
  const models = [];
  const lines = content.split('\n');
  
  // Look for model patterns
  const modelPatterns = [
    { name: 'Prisma Model', pattern: /prisma\.(\w+)\./g },
    { name: 'Model Definition', pattern: /model\s+(\w+)\s*{/g },
    { name: 'Type Definition', pattern: /type\s+(\w+)\s*=/g },
    { name: 'Interface Definition', pattern: /interface\s+(\w+)\s*{/g }
  ];
  
  for (const model of modelPatterns) {
    let match;
    while ((match = model.pattern.exec(content)) !== null) {
      const lineNum = content.substring(0, match.index).split('\n').length;
      
      models.push({
        name: match[1],
        file: relative('src', filePath),
        line: lineNum,
        type: model.name
      });
    }
  }
  
  return models;
}

// Helper to extract feature flags
function extractFeatureFlags(content, filePath) {
  const flags = [];
  const lines = content.split('\n');
  
  // Look for feature flag patterns
  const flagPatterns = [
    { name: 'Feature Flag', pattern: /FEATURE_\w+/g },
    { name: 'Flag Function', pattern: /flag\s*\(\s*['"`]([^'"`]+)['"`]/g },
    { name: 'Flag Variable', pattern: /(?:const|let|var)\s+([A-Z_][A-Z0-9_]*)\s*=\s*flag/i }
  ];
  
  for (const flag of flagPatterns) {
    let match;
    while ((match = flag.pattern.exec(content)) !== null) {
      const lineNum = content.substring(0, match.index).split('\n').length;
      
      flags.push({
        name: match[1],
        file: relative('src', filePath),
        line: lineNum,
        type: flag.name
      });
    }
  }
  
  return flags;
}

// Helper to extract jobs
function extractJobs(content, filePath) {
  const jobs = [];
  const lines = content.split('\n');
  
  // Look for job patterns
  const jobPatterns = [
    { name: 'Job Function', pattern: /export\s+(?:const|function)\s+(\w*[Jj]ob\w*)/i },
    { name: 'Cron Job', pattern: /export\s+(?:const|function)\s+(\w*[Cc]ron\w*)/i },
    { name: 'Queue Job', pattern: /export\s+(?:const|function)\s+(\w*[Qq]ueue\w*)/i }
  ];
  
  for (const job of jobPatterns) {
    const matches = content.match(job.pattern);
    if (matches) {
      const lineNum = content.search(job.pattern);
      const line = content.substring(0, lineNum).split('\n').length;
      
      jobs.push({
        name: matches[1],
        file: relative('src', filePath),
        line: line,
        type: job.name
      });
    }
  }
  
  return jobs;
}

// Scan for Brand Run related files
console.log('🔍 Scanning for Brand Run related files...');
const brandRunFiles = findFiles('src', /\.(ts|tsx)$/);

for (const filePath of brandRunFiles) {
  try {
    const content = readFileSync(filePath, 'utf8');
    
    // Check if file contains Brand Run related code
    if (content.match(/brand.*run|brandrun/i)) {
      const steps = extractBrandRunStep(content, filePath);
      const components = extractComponents(content, filePath);
      const routes = extractAPIRoutes(content, filePath);
      const services = extractServices(content, filePath);
      const models = extractModels(content, filePath);
      const flags = extractFeatureFlags(content, filePath);
      const jobs = extractJobs(content, filePath);
      
      // Add to appropriate steps
      for (const step of steps) {
        if (results.steps[step.name]) {
          results.steps[step.name].components.push(...components);
          results.steps[step.name].apiRoutes.push(...routes);
          results.steps[step.name].services.push(...services);
          results.steps[step.name].models.push(...models);
          results.steps[step.name].flags.push(...flags);
          results.steps[step.name].jobs.push(...jobs);
        }
      }
    }
  } catch (error) {
    errors.push(`Error reading ${filePath}: ${error.message}`);
  }
}

// Check for specific Brand Run directories
console.log('🔍 Checking for Brand Run directories...');
const brandRunDirs = [
  'src/app/brandrun',
  'src/app/tools/brandrun',
  'src/components/brandrun',
  'src/services/brandrun'
];

for (const dir of brandRunDirs) {
  if (existsSync(dir)) {
    const files = findFiles(dir, /\.(ts|tsx)$/);
    for (const filePath of files) {
      try {
        const content = readFileSync(filePath, 'utf8');
        const steps = extractBrandRunStep(content, filePath);
        const components = extractComponents(content, filePath);
        const routes = extractAPIRoutes(content, filePath);
        const services = extractServices(content, filePath);
        const models = extractModels(content, filePath);
        const flags = extractFeatureFlags(content, filePath);
        const jobs = extractJobs(content, filePath);
        
        // Add to appropriate steps
        for (const step of steps) {
          if (results.steps[step.name]) {
            results.steps[step.name].components.push(...components);
            results.steps[step.name].apiRoutes.push(...routes);
            results.steps[step.name].services.push(...services);
            results.steps[step.name].models.push(...models);
            results.steps[step.name].flags.push(...flags);
            results.steps[step.name].jobs.push(...jobs);
          }
        }
      } catch (error) {
        errors.push(`Error reading ${filePath}: ${error.message}`);
      }
    }
  }
}

// Add errors to results
results.errors = errors;

// Write outputs
import { writeFileSync } from 'fs';

// Write JSON output
writeFileSync('docs/audit/brandrun-trace.json', JSON.stringify(results, null, 2));

// Write Markdown output
const mdContent = `# Brand Run Trace Report

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

#### Components
${stepData.components.map(comp => `- **${comp.name}** (\`${comp.file}:${comp.line}\`) - ${comp.type}`).join('\n')}

#### API Routes
${stepData.apiRoutes.map(route => `- **${route.name}** (\`${route.file}:${route.line}\`) - ${route.type}`).join('\n')}

#### Services
${stepData.services.map(service => `- **${service.name}** (\`${service.file}:${service.line}\`) - ${service.type}`).join('\n')}

#### Models
${stepData.models.map(model => `- **${model.name}** (\`${model.file}:${model.line}\`) - ${model.type}`).join('\n')}

#### Feature Flags
${stepData.flags.map(flag => `- **${flag.name}** (\`${flag.file}:${flag.line}\`) - ${flag.type}`).join('\n')}

#### Jobs
${stepData.jobs.map(job => `- **${job.name}** (\`${job.file}:${job.line}\`) - ${job.type}`).join('\n')}
`).join('\n')}

## Summary
- **Total Steps**: ${Object.keys(results.steps).length}
- **Total Components**: ${Object.values(results.steps).reduce((sum, step) => sum + step.components.length, 0)}
- **Total API Routes**: ${Object.values(results.steps).reduce((sum, step) => sum + step.apiRoutes.length, 0)}
- **Total Services**: ${Object.values(results.steps).reduce((sum, step) => sum + step.services.length, 0)}
- **Total Models**: ${Object.values(results.steps).reduce((sum, step) => sum + step.models.length, 0)}
- **Total Flags**: ${Object.values(results.steps).reduce((sum, step) => sum + step.flags.length, 0)}
- **Total Jobs**: ${Object.values(results.steps).reduce((sum, step) => sum + step.jobs.length, 0)}

## Coverage Analysis
${Object.entries(results.steps).map(([stepName, stepData]) => {
  const total = stepData.components.length + stepData.apiRoutes.length + stepData.services.length + stepData.models.length + stepData.flags.length + stepData.jobs.length;
  return `- **${stepName.charAt(0).toUpperCase() + stepName.slice(1)}**: ${total} items`;
}).join('\n')}

${errors.length > 0 ? `
## Errors
${errors.map(error => `- ❌ ${error}`).join('\n')}
` : ''}
`;

writeFileSync('docs/audit/brandrun-trace.md', mdContent);

console.log('✅ Brand Run trace complete');
console.log(`📄 JSON: docs/audit/brandrun-trace.json`);
console.log(`📄 Markdown: docs/audit/brandrun-trace.md`);
