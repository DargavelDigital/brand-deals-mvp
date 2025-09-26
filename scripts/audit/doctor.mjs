#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const errors = [];
const results = {
  timestamp: new Date().toISOString(),
  tools: {},
  typecheck: { ok: false, errors: [] },
  depcheck: null
};

// Helper to safely run commands
function safeExec(command, description) {
  try {
    const output = execSync(command, { encoding: 'utf8', timeout: 30000 });
    return output.trim();
  } catch (error) {
    errors.push(`${description}: ${error.message}`);
    return null;
  }
}

// Check tool versions
console.log('🔍 Checking tool versions...');

results.tools.node = safeExec('node -v', 'Node version check');
results.tools.pnpm = safeExec('pnpm -v', 'pnpm version check');
results.tools.next = safeExec('npx --yes next --version', 'Next.js version check');
results.tools.typescript = safeExec('npx --yes tsc --version', 'TypeScript version check');

// Check TypeScript compilation
console.log('🔍 Running TypeScript type check...');
try {
  const tscOutput = execSync('npx --yes tsc --noEmit', { 
    encoding: 'utf8', 
    timeout: 60000,
    stdio: 'pipe'
  });
  results.typecheck.ok = true;
  results.typecheck.errors = [];
} catch (error) {
  results.typecheck.ok = false;
  const errorOutput = error.stdout || error.stderr || '';
  const errorLines = errorOutput.split('\n').filter(line => 
    line.includes('error') || line.includes('Error')
  ).slice(0, 50);
  results.typecheck.errors = errorLines;
}

// Check for depcheck
console.log('🔍 Checking for unused dependencies...');
try {
  const depcheckOutput = execSync('npx --yes depcheck', { 
    encoding: 'utf8', 
    timeout: 30000,
    stdio: 'pipe'
  });
  results.depcheck = {
    output: depcheckOutput,
    hasUnused: depcheckOutput.includes('Unused dependencies') || depcheckOutput.includes('Unused devDependencies')
  };
} catch (error) {
  results.depcheck = {
    error: error.message,
    hasUnused: false
  };
}

// Check package.json for critical dependencies
console.log('🔍 Checking critical dependencies...');
try {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  const criticalDeps = [
    'next', 'react', 'typescript', 'prisma', '@prisma/client',
    'tailwindcss', 'next-auth', 'stripe', 'zod'
  ];
  
  results.dependencies = {
    critical: {},
    missing: []
  };
  
  for (const dep of criticalDeps) {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      results.dependencies.critical[dep] = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
    } else {
      results.dependencies.missing.push(dep);
    }
  }
} catch (error) {
  errors.push(`Package.json read error: ${error.message}`);
}

// Check for lockfile
results.lockfile = existsSync('pnpm-lock.yaml') ? 'pnpm-lock.yaml' : null;

// Check for environment files
results.envFiles = {
  env: existsSync('.env'),
  envLocal: existsSync('.env.local'),
  envExample: existsSync('env.example')
};

// Check for critical config files
results.configFiles = {
  nextConfig: existsSync('next.config.ts') || existsSync('next.config.js'),
  tailwindConfig: existsSync('tailwind.config.ts') || existsSync('tailwind.config.js'),
  tsConfig: existsSync('tsconfig.json'),
  prismaSchema: existsSync('prisma/schema.prisma'),
  netlifyToml: existsSync('netlify.toml')
};

// Add any errors to results
results.errors = errors;

// Write outputs
import { writeFileSync } from 'fs';

// Write JSON output
writeFileSync('docs/audit/doctor.json', JSON.stringify(results, null, 2));

// Write Markdown output
const mdContent = `# Doctor Audit Report

Generated: ${results.timestamp}

## Tool Versions
- **Node.js**: ${results.tools.node || '❌ Not found'}
- **pnpm**: ${results.tools.pnpm || '❌ Not found'}
- **Next.js**: ${results.tools.next || '❌ Not found'}
- **TypeScript**: ${results.tools.typescript || '❌ Not found'}

## TypeScript Compilation
**Status**: ${results.typecheck.ok ? '✅ PASS' : '❌ FAIL'}

${results.typecheck.errors.length > 0 ? `
### Type Errors (${results.typecheck.errors.length} shown)
\`\`\`
${results.typecheck.errors.join('\n')}
\`\`\`
` : ''}

## Dependencies
${results.dependencies ? `
### Critical Dependencies
${Object.entries(results.dependencies.critical).map(([dep, version]) => 
  `- **${dep}**: ${version}`
).join('\n')}

### Missing Dependencies
${results.dependencies.missing.length > 0 ? 
  results.dependencies.missing.map(dep => `- ❌ **${dep}**`).join('\n') : 
  '- ✅ All critical dependencies present'
}
` : ''}

## Dependency Check
${results.depcheck ? `
**Status**: ${results.depcheck.hasUnused ? '⚠️ UNUSED DEPS FOUND' : '✅ CLEAN'}

${results.depcheck.error ? `
**Error**: ${results.depcheck.error}
` : ''}
` : ''}

## Project Structure
- **Lockfile**: ${results.lockfile || '❌ Missing'}
- **Environment Files**: 
  - .env: ${results.envFiles.env ? '✅' : '❌'}
  - .env.local: ${results.envFiles.envLocal ? '✅' : '❌'}
  - env.example: ${results.envFiles.envExample ? '✅' : '❌'}

## Config Files
- **Next.js Config**: ${results.configFiles.nextConfig ? '✅' : '❌'}
- **Tailwind Config**: ${results.configFiles.tailwindConfig ? '✅' : '❌'}
- **TypeScript Config**: ${results.configFiles.tsConfig ? '✅' : '❌'}
- **Prisma Schema**: ${results.configFiles.prismaSchema ? '✅' : '❌'}
- **Netlify Config**: ${results.configFiles.netlifyToml ? '✅' : '❌'}

${errors.length > 0 ? `
## Errors
${errors.map(error => `- ❌ ${error}`).join('\n')}
` : ''}

## Summary
- **Build Status**: ${results.typecheck.ok ? '✅ Ready' : '❌ Needs fixes'}
- **Dependencies**: ${results.dependencies?.missing.length === 0 ? '✅ Complete' : '⚠️ Missing some'}
- **Config**: ${Object.values(results.configFiles).every(Boolean) ? '✅ Complete' : '⚠️ Missing some'}
`;

writeFileSync('docs/audit/doctor.md', mdContent);

console.log('✅ Doctor audit complete');
console.log(`📄 JSON: docs/audit/doctor.json`);
console.log(`📄 Markdown: docs/audit/doctor.md`);
