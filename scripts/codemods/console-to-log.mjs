#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { glob } from 'glob';
import { relative } from 'node:path';

// Critical paths to scan
const CRITICAL_PATHS = [
  'src/app/api/**/*.{ts,tsx}',
  'src/services/**/*.{ts,tsx}',
  'src/lib/jobs/**/*.{ts,tsx}',
  'src/services/brandRun/**/*.{ts,tsx}'
];

// Patterns to match console statements
const CONSOLE_PATTERNS = {
  log: /console\.log\s*\(/g,
  info: /console\.info\s*\(/g,
  warn: /console\.warn\s*\(/g,
  error: /console\.error\s*\(/g
};

// Import pattern for log
const LOG_IMPORT_PATTERN = /import\s*\{\s*[^}]*log[^}]*\}\s*from\s*["']@\/lib\/log["']/;
const LOG_USAGE_PATTERN = /log\.(info|warn|error)\s*\(/;

// Test file patterns to skip
const TEST_PATTERNS = [
  /\.test\.(ts|tsx)$/,
  /\.spec\.(ts|tsx)$/,
  /__tests__/,
  /test\//,
  /spec\//
];

function isTestFile(filePath) {
  return TEST_PATTERNS.some(pattern => pattern.test(filePath));
}

function hasLogImport(content) {
  return LOG_IMPORT_PATTERN.test(content);
}

function hasLogUsage(content) {
  return LOG_USAGE_PATTERN.test(content);
}

function addLogImport(content) {
  // Find the last import statement
  const importLines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < importLines.length; i++) {
    if (importLines[i].trim().startsWith('import ')) {
      lastImportIndex = i;
    }
  }
  
  if (lastImportIndex === -1) {
    // No imports found, add at the top
    return `import { log } from '@/lib/log';\n${content}`;
  } else {
    // Add after the last import
    importLines.splice(lastImportIndex + 1, 0, "import { log } from '@/lib/log';");
    return importLines.join('\n');
  }
}

function replaceConsoleStatements(content) {
  let modified = content;
  let replacements = 0;
  
  // Replace console.log with log.info
  const logMatches = modified.match(CONSOLE_PATTERNS.log);
  if (logMatches) {
    modified = modified.replace(CONSOLE_PATTERNS.log, 'log.info(');
    replacements += logMatches.length;
  }
  
  // Replace console.info with log.info
  const infoMatches = modified.match(CONSOLE_PATTERNS.info);
  if (infoMatches) {
    modified = modified.replace(CONSOLE_PATTERNS.info, 'log.info(');
    replacements += infoMatches.length;
  }
  
  // Replace console.warn with log.warn
  const warnMatches = modified.match(CONSOLE_PATTERNS.warn);
  if (warnMatches) {
    modified = modified.replace(CONSOLE_PATTERNS.warn, 'log.warn(');
    replacements += warnMatches.length;
  }
  
  // Replace console.error with log.error
  const errorMatches = modified.match(CONSOLE_PATTERNS.error);
  if (errorMatches) {
    modified = modified.replace(CONSOLE_PATTERNS.error, 'log.error(');
    replacements += errorMatches.length;
  }
  
  return { content: modified, replacements };
}

function processFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    
    // Skip test files
    if (isTestFile(filePath)) {
      return { skipped: true, reason: 'test file' };
    }
    
    // Check if file has console statements
    const hasConsole = Object.values(CONSOLE_PATTERNS).some(pattern => pattern.test(content));
    if (!hasConsole) {
      return { skipped: true, reason: 'no console statements' };
    }
    
    // Skip if already using log AND no console statements
    if (hasLogUsage(content) && !hasConsole) {
      return { skipped: true, reason: 'already using log' };
    }
    
    // Replace console statements
    const { content: newContent, replacements } = replaceConsoleStatements(content);
    
    // Add log import if needed
    let finalContent = newContent;
    if (!hasLogImport(newContent)) {
      finalContent = addLogImport(newContent);
    }
    
    // Write the modified content
    writeFileSync(filePath, finalContent, 'utf8');
    
    return { 
      processed: true, 
      replacements,
      addedImport: !hasLogImport(content)
    };
    
  } catch (error) {
    return { 
      error: true, 
      message: error.message 
    };
  }
}

async function main() {
  console.log('🔧 Console to Log Codemod');
  console.log('========================\n');
  
  // Find all files in critical paths
  const files = [];
  for (const pattern of CRITICAL_PATHS) {
    const matches = await glob(pattern);
    files.push(...matches);
  }
  
  console.log(`📁 Found ${files.length} files in critical paths`);
  console.log(`   - src/app/api/**/*.{ts,tsx}`);
  console.log(`   - src/services/**/*.{ts,tsx}`);
  console.log(`   - src/lib/jobs/**/*.{ts,tsx}`);
  console.log(`   - src/services/brandRun/**/*.{ts,tsx}\n`);
  
  let processed = 0;
  let skipped = 0;
  let errors = 0;
  let totalReplacements = 0;
  let addedImports = 0;
  
  const results = [];
  
  for (const filePath of files) {
    const result = processFile(filePath);
    results.push({ filePath, result });
    
    if (result.error) {
      errors++;
      console.log(`❌ ${relative('src', filePath)}: ${result.message}`);
    } else if (result.skipped) {
      skipped++;
      console.log(`⏭️  ${relative('src', filePath)}: ${result.reason}`);
    } else if (result.processed) {
      processed++;
      totalReplacements += result.replacements;
      if (result.addedImport) addedImports++;
      console.log(`✅ ${relative('src', filePath)}: ${result.replacements} replacements${result.addedImport ? ' + import' : ''}`);
    }
  }
  
  console.log('\n📊 Summary');
  console.log('==========');
  console.log(`✅ Processed: ${processed} files`);
  console.log(`⏭️  Skipped: ${skipped} files`);
  console.log(`❌ Errors: ${errors} files`);
  console.log(`🔄 Total replacements: ${totalReplacements}`);
  console.log(`📦 Added imports: ${addedImports}`);
  
  // Show detailed results for processed files
  if (processed > 0) {
    console.log('\n📝 Processed Files:');
    results
      .filter(r => r.result.processed)
      .forEach(r => {
        console.log(`   ${relative('src', r.filePath)}: ${r.result.replacements} replacements${r.result.addedImport ? ' + import' : ''}`);
      });
  }
  
  // Show skipped files with reasons
  if (skipped > 0) {
    console.log('\n⏭️  Skipped Files:');
    const skippedByReason = {};
    results
      .filter(r => r.result.skipped)
      .forEach(r => {
        const reason = r.result.reason;
        if (!skippedByReason[reason]) skippedByReason[reason] = [];
        skippedByReason[reason].push(relative('src', r.filePath));
      });
    
    Object.entries(skippedByReason).forEach(([reason, files]) => {
      console.log(`   ${reason}: ${files.length} files`);
      if (files.length <= 5) {
        files.forEach(file => console.log(`     - ${file}`));
      } else {
        files.slice(0, 3).forEach(file => console.log(`     - ${file}`));
        console.log(`     ... and ${files.length - 3} more`);
      }
    });
  }
  
  if (errors > 0) {
    console.log('\n❌ Errors:');
    results
      .filter(r => r.result.error)
      .forEach(r => {
        console.log(`   ${relative('src', r.filePath)}: ${r.result.message}`);
      });
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Run: npm -s eslint "src/{app,services,lib/jobs,services/brandRun}/**/*.{ts,tsx}"');
  console.log('2. Run: npm audit:obs');
  console.log('3. Verify criticalCount has dropped significantly');
  
  process.exit(errors > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('❌ Codemod failed:', error);
  process.exit(1);
});
