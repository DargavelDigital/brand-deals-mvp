#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const errors = [];
const results = {
  timestamp: new Date().toISOString(),
  referenced: {
    processEnv: [],
    nextPublic: []
  },
  defined: {
    local: {},
    netlify: {}
  },
  featureFlags: {},
  errors: []
};

// Helper to find all source files
function findSourceFiles() {
  const files = [];
  const dirs = ['src'];
  
  function scanDir(dir) {
    try {
      const entries = require('fs').readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      errors.push(`Error scanning ${dir}: ${error.message}`);
    }
  }
  
  for (const dir of dirs) {
    scanDir(dir);
  }
  
  return files;
}

// Helper to extract environment variable references
function extractEnvRefs(content, filePath) {
  const refs = {
    processEnv: [],
    nextPublic: []
  };
  
  // Find process.env.X references
  const processEnvRegex = /process\.env\.([A-Z_][A-Z0-9_]*)/g;
  let match;
  while ((match = processEnvRegex.exec(content)) !== null) {
    refs.processEnv.push({
      variable: match[1],
      file: filePath,
      line: content.substring(0, match.index).split('\n').length
    });
  }
  
  // Find NEXT_PUBLIC_* references
  const nextPublicRegex = /NEXT_PUBLIC_([A-Z_][A-Z0-9_]*)/g;
  while ((match = nextPublicRegex.exec(content)) !== null) {
    refs.nextPublic.push({
      variable: `NEXT_PUBLIC_${match[1]}`,
      file: filePath,
      line: content.substring(0, match.index).split('\n').length
    });
  }
  
  return refs;
}

// Helper to parse .env file
function parseEnvFile(filePath) {
  const env = {};
  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    }
  } catch (error) {
    errors.push(`Error reading ${filePath}: ${error.message}`);
  }
  return env;
}

// Helper to parse netlify.toml
function parseNetlifyToml() {
  const env = {};
  try {
    if (existsSync('netlify.toml')) {
      const content = readFileSync('netlify.toml', 'utf8');
      const lines = content.split('\n');
      let inBuildEnv = false;
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === '[build.environment]') {
          inBuildEnv = true;
          continue;
        }
        if (inBuildEnv && trimmed.startsWith('[')) {
          break;
        }
        if (inBuildEnv && trimmed.includes('=')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key) {
            env[key.trim()] = valueParts.join('=').trim();
          }
        }
      }
    }
  } catch (error) {
    errors.push(`Error reading netlify.toml: ${error.message}`);
  }
  return env;
}

// Helper to extract feature flags
function extractFeatureFlags(content, filePath) {
  const flags = {};
  
  // Look for flag definitions
  const flagDefRegex = /(?:const|let|var)\s+([A-Z_][A-Z0-9_]*)\s*=\s*(?:flag\s*\()?['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = flagDefRegex.exec(content)) !== null) {
    const [, name, value] = match;
    if (name.includes('FEATURE_') || name.includes('FLAG_')) {
      flags[name] = {
        value,
        file: filePath,
        line: content.substring(0, match.index).split('\n').length
      };
    }
  }
  
  // Look for flag usage
  const flagUsageRegex = /flag\s*\(\s*['"`]([^'"`]+)['"`]/g;
  while ((match = flagUsageRegex.exec(content)) !== null) {
    const flagName = match[1];
    if (!flags[flagName]) {
      flags[flagName] = {
        value: 'used',
        file: filePath,
        line: content.substring(0, match.index).split('\n').length,
        usage: true
      };
    }
  }
  
  return flags;
}

// Scan all source files for environment references
console.log('🔍 Scanning source files for environment variable references...');
const sourceFiles = findSourceFiles();

for (const filePath of sourceFiles) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const refs = extractEnvRefs(content, filePath);
    
    results.referenced.processEnv.push(...refs.processEnv);
    results.referenced.nextPublic.push(...refs.nextPublic);
    
    // Extract feature flags
    const flags = extractFeatureFlags(content, filePath);
    Object.assign(results.featureFlags, flags);
    
  } catch (error) {
    errors.push(`Error reading ${filePath}: ${error.message}`);
  }
}

// Load environment files
console.log('🔍 Loading environment files...');
if (existsSync('.env')) {
  results.defined.local = parseEnvFile('.env');
}
if (existsSync('.env.local')) {
  const localEnv = parseEnvFile('.env.local');
  Object.assign(results.defined.local, localEnv);
}

results.defined.netlify = parseNetlifyToml();

// Analyze environment coverage
console.log('🔍 Analyzing environment coverage...');

// Get unique variable names
const referencedProcessEnv = [...new Set(results.referenced.processEnv.map(ref => ref.variable))];
const referencedNextPublic = [...new Set(results.referenced.nextPublic.map(ref => ref.variable))];

// Check coverage
const processEnvCoverage = referencedProcessEnv.map(variable => ({
  variable,
  defined: {
    local: variable in results.defined.local,
    netlify: variable in results.defined.netlify
  },
  references: results.referenced.processEnv.filter(ref => ref.variable === variable)
}));

const nextPublicCoverage = referencedNextPublic.map(variable => ({
  variable,
  defined: {
    local: variable in results.defined.local,
    netlify: variable in results.defined.netlify
  },
  references: results.referenced.nextPublic.filter(ref => ref.variable === variable)
}));

results.coverage = {
  processEnv: processEnvCoverage,
  nextPublic: nextPublicCoverage
};

// Add errors to results
results.errors = errors;

// Write outputs
import { writeFileSync } from 'fs';

// Write JSON output
writeFileSync('docs/audit/env-flags.json', JSON.stringify(results, null, 2));

// Write Markdown output
const mdContent = `# Environment Variables & Feature Flags Report

Generated: ${results.timestamp}

## Referenced Variables

### process.env Variables (${referencedProcessEnv.length})
${processEnvCoverage.map(env => `
#### ${env.variable}
- **Local**: ${env.defined.local ? '✅' : '❌'}
- **Netlify**: ${env.defined.netlify ? '✅' : '❌'}
- **References**: ${env.references.length}
${env.references.map(ref => `  - \`${ref.file}:${ref.line}\``).join('\n')}
`).join('\n')}

### NEXT_PUBLIC Variables (${referencedNextPublic.length})
${nextPublicCoverage.map(env => `
#### ${env.variable}
- **Local**: ${env.defined.local ? '✅' : '❌'}
- **Netlify**: ${env.defined.netlify ? '✅' : '❌'}
- **References**: ${env.references.length}
${env.references.map(ref => `  - \`${ref.file}:${ref.line}\``).join('\n')}
`).join('\n')}

## Defined Variables

### Local Environment (.env, .env.local)
${Object.keys(results.defined.local).length > 0 ? 
  Object.keys(results.defined.local).map(key => `- **${key}**: \`${results.defined.local[key] ? '[SET]' : '[EMPTY]'}\``).join('\n') :
  'No local environment variables found'
}

### Netlify Environment
${Object.keys(results.defined.netlify).length > 0 ? 
  Object.keys(results.defined.netlify).map(key => `- **${key}**: \`${results.defined.netlify[key] ? '[SET]' : '[EMPTY]'}\``).join('\n') :
  'No Netlify environment variables found'
}

## Feature Flags
${Object.keys(results.featureFlags).length > 0 ? 
  Object.entries(results.featureFlags).map(([name, flag]) => `
### ${name}
- **Value**: \`${flag.value}\`
- **File**: \`${flag.file}:${flag.line}\`
- **Usage**: ${flag.usage ? '✅ Used' : '⚠️ Defined only'}
`).join('\n') :
  'No feature flags found'
}

## Coverage Analysis

### Missing Variables
${processEnvCoverage.filter(env => !env.defined.local && !env.defined.netlify).map(env => `- ❌ **${env.variable}** (${env.references.length} references)`).join('\n') || '✅ All process.env variables are defined'}

${nextPublicCoverage.filter(env => !env.defined.local && !env.defined.netlify).map(env => `- ❌ **${env.variable}** (${env.references.length} references)`).join('\n') || '✅ All NEXT_PUBLIC variables are defined'}

### Unused Variables
${Object.keys(results.defined.local).filter(key => 
  !referencedProcessEnv.includes(key) && !referencedNextPublic.includes(key)
).map(key => `- ⚠️ **${key}** (defined but not used)`).join('\n') || '✅ All defined variables are used'}

## Summary
- **Referenced process.env**: ${referencedProcessEnv.length}
- **Referenced NEXT_PUBLIC**: ${referencedNextPublic.length}
- **Defined locally**: ${Object.keys(results.defined.local).length}
- **Defined in Netlify**: ${Object.keys(results.defined.netlify).length}
- **Feature flags**: ${Object.keys(results.featureFlags).length}
- **Missing variables**: ${processEnvCoverage.filter(env => !env.defined.local && !env.defined.netlify).length + nextPublicCoverage.filter(env => !env.defined.local && !env.defined.netlify).length}

${errors.length > 0 ? `
## Errors
${errors.map(error => `- ❌ ${error}`).join('\n')}
` : ''}
`;

writeFileSync('docs/audit/env-flags.md', mdContent);

console.log('✅ Environment variables audit complete');
console.log(`📄 JSON: docs/audit/env-flags.json`);
console.log(`📄 Markdown: docs/audit/env-flags.md`);
