#!/usr/bin/env node

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, relative } from 'path';

const errors = [];
const results = {
  timestamp: new Date().toISOString(),
  scanning: {
    totalFilesScanned: 0,
    criticalFilesScanned: 0,
    criticalPaths: [
      'src/app/api/',
      'src/services/',
      'src/lib/jobs/',
      'src/services/brandRun/'
    ]
  },
  requestId: {
    generation: [],
    propagation: [],
    usage: []
  },
  logging: {
    structured: false,
    centralLogger: false,
    hasNewLogger: false,
    consoleLogs: [],
    criticalCount: 0,
    totalCount: 0,
    topOffendingFiles: []
  },
  tracing: {
    spans: [],
    context: []
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

// Helper to extract request ID patterns
function extractRequestIdPatterns(content, filePath) {
  const patterns = {
    generation: [],
    propagation: [],
    usage: []
  };
  
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for request ID generation
    const generationPatterns = [
      /requestId\s*[=:]\s*uuid/i,
      /generateRequestId/i,
      /createRequestId/i,
      /new.*requestId/i
    ];
    
    for (const pattern of generationPatterns) {
      if (pattern.test(line)) {
        patterns.generation.push({
          file: relative('src', filePath),
          line: i + 1,
          content: line.trim(),
          pattern: pattern.source
        });
      }
    }
    
    // Look for request ID propagation
    const propagationPatterns = [
      /requestId.*header/i,
      /header.*requestId/i,
      /propagate.*requestId/i,
      /pass.*requestId/i
    ];
    
    for (const pattern of propagationPatterns) {
      if (pattern.test(line)) {
        patterns.propagation.push({
          file: relative('src', filePath),
          line: i + 1,
          content: line.trim(),
          pattern: pattern.source
        });
      }
    }
    
    // Look for request ID usage
    const usagePatterns = [
      /requestId.*log/i,
      /log.*requestId/i,
      /requestId.*error/i,
      /error.*requestId/i
    ];
    
    for (const pattern of usagePatterns) {
      if (pattern.test(line)) {
        patterns.usage.push({
          file: relative('src', filePath),
          line: i + 1,
          content: line.trim(),
          pattern: pattern.source
        });
      }
    }
  }
  
  return patterns;
}

// Helper to check if file is in critical path
function isCriticalPath(filePath) {
  const criticalPaths = [
    'src/app/api/',
    'src/services/',
    'src/lib/jobs/',
    'src/services/brandRun/'
  ];
  
  return criticalPaths.some(path => filePath.includes(path));
}

// Helper to check structured logging
function checkStructuredLogging(content, filePath) {
  const structured = {
    hasStructured: false,
    hasCentralLogger: false,
    hasNewLogger: false,
    consoleLogs: []
  };
  
  const lines = content.split('\n');
  
  // Look for structured logging patterns (including new logger)
  const structuredPatterns = [
    /logger\.(info|warn|error|debug)/i,
    /log\.(info|warn|error|debug)/i,
    /structured.*log/i,
    /json.*log/i,
    /from.*@\/lib\/log/i,  // New logger import
    /import.*log.*from/i   // New logger import pattern
  ];
  
  structured.hasStructured = structuredPatterns.some(pattern => pattern.test(content));
  
  // Check for new logger specifically
  const newLoggerPatterns = [
    /from.*@\/lib\/log/i,
    /import.*log.*from.*@\/lib\/log/i,
    /log\.(info|warn|error)\(/i
  ];
  
  structured.hasNewLogger = newLoggerPatterns.some(pattern => pattern.test(content));
  
  // Look for central logger
  const centralLoggerPatterns = [
    /central.*logger/i,
    /logger.*instance/i,
    /singleton.*logger/i,
    /logger.*factory/i
  ];
  
  structured.hasCentralLogger = centralLoggerPatterns.some(pattern => pattern.test(content));
  
  // Find console.log usage only in critical paths
  if (isCriticalPath(filePath)) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.match(/^\s*console\.(log|warn|error|info|debug)\s*\(/)) {
        structured.consoleLogs.push({
          file: relative('src', filePath),
          line: i + 1,
          content: line.trim()
        });
      }
    }
  }
  
  return structured;
}

// Helper to extract tracing patterns
function extractTracingPatterns(content, filePath) {
  const tracing = {
    spans: [],
    context: []
  };
  
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for span patterns
    const spanPatterns = [
      /span.*start/i,
      /span.*end/i,
      /createSpan/i,
      /startSpan/i,
      /endSpan/i
    ];
    
    for (const pattern of spanPatterns) {
      if (pattern.test(line)) {
        tracing.spans.push({
          file: relative('src', filePath),
          line: i + 1,
          content: line.trim(),
          pattern: pattern.source
        });
      }
    }
    
    // Look for context patterns
    const contextPatterns = [
      /trace.*context/i,
      /context.*trace/i,
      /span.*context/i,
      /trace.*id/i
    ];
    
    for (const pattern of contextPatterns) {
      if (pattern.test(line)) {
        tracing.context.push({
          file: relative('src', filePath),
          line: i + 1,
          content: line.trim(),
          pattern: pattern.source
        });
      }
    }
  }
  
  return tracing;
}

// Scan for observability-related files in critical paths only
console.log('🔍 Scanning critical paths for observability patterns...');
const criticalPaths = [
  'src/app/api',
  'src/services',
  'src/lib/jobs',
  'src/services/brandRun'
];

let totalFilesScanned = 0;
let criticalFilesScanned = 0;

for (const criticalPath of criticalPaths) {
  if (existsSync(criticalPath)) {
    const files = findFiles(criticalPath, /\.(ts|tsx)$/);
    totalFilesScanned += files.length;
    
    for (const filePath of files) {
      try {
        const content = readFileSync(filePath, 'utf8');
        criticalFilesScanned++;
        
        // Check if file contains observability-related code
        if (content.match(/log|trace|requestId|observability/i)) {
          const requestIdPatterns = extractRequestIdPatterns(content, filePath);
          const structured = checkStructuredLogging(content, filePath);
          const tracing = extractTracingPatterns(content, filePath);
          
          results.requestId.generation.push(...requestIdPatterns.generation);
          results.requestId.propagation.push(...requestIdPatterns.propagation);
          results.requestId.usage.push(...requestIdPatterns.usage);
          
          if (structured.hasStructured) {
            results.logging.structured = true;
          }
          if (structured.hasCentralLogger) {
            results.logging.centralLogger = true;
          }
          if (structured.hasNewLogger) {
            results.logging.hasNewLogger = true;
          }
          results.logging.consoleLogs.push(...structured.consoleLogs);
          
          results.tracing.spans.push(...tracing.spans);
          results.tracing.context.push(...tracing.context);
        }
      } catch (error) {
        errors.push(`Error reading ${filePath}: ${error.message}`);
      }
    }
  }
}

console.log(`📊 Scanned ${criticalFilesScanned} files in critical paths (${totalFilesScanned} total files found)`);

// Update results with scanning data
results.scanning.totalFilesScanned = totalFilesScanned;
results.scanning.criticalFilesScanned = criticalFilesScanned;

// Check for specific observability service files
console.log('🔍 Checking for observability service files...');
const observabilityServiceFiles = [
  'src/services/observability',
  'src/lib/observability',
  'src/lib/logger',
  'src/lib/tracing'
];

for (const serviceDir of observabilityServiceFiles) {
  if (existsSync(serviceDir)) {
    const serviceFiles = findFiles(serviceDir, /\.(ts|tsx)$/);
    for (const filePath of serviceFiles) {
      try {
        const content = readFileSync(filePath, 'utf8');
        const requestIdPatterns = extractRequestIdPatterns(content, filePath);
        const structured = checkStructuredLogging(content, filePath);
        const tracing = extractTracingPatterns(content, filePath);
        
        results.requestId.generation.push(...requestIdPatterns.generation);
        results.requestId.propagation.push(...requestIdPatterns.propagation);
        results.requestId.usage.push(...requestIdPatterns.usage);
        
        if (structured.hasStructured) {
          results.logging.structured = true;
        }
        if (structured.hasCentralLogger) {
          results.logging.centralLogger = true;
        }
        if (structured.hasNewLogger) {
          results.logging.hasNewLogger = true;
        }
        results.logging.consoleLogs.push(...structured.consoleLogs);
        
        results.tracing.spans.push(...tracing.spans);
        results.tracing.context.push(...tracing.context);
      } catch (error) {
        errors.push(`Error reading ${filePath}: ${error.message}`);
      }
    }
  }
}

// Analyze console.log usage by file
console.log('🔍 Analyzing console.log usage by file...');
const consoleLogsByFile = {};
results.logging.consoleLogs.forEach(log => {
  if (!consoleLogsByFile[log.file]) {
    consoleLogsByFile[log.file] = 0;
  }
  consoleLogsByFile[log.file]++;
});

// Get top offending files
const topOffendingFiles = Object.entries(consoleLogsByFile)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 10)
  .map(([file, count]) => ({ file, count }));

console.log(`📊 Found ${results.logging.consoleLogs.length} console.* statements in critical paths`);
console.log(`📊 Top offending files:`);
topOffendingFiles.forEach(({ file, count }) => {
  console.log(`   ${file}: ${count} statements`);
});

// Update results with console.log analysis
results.logging.criticalCount = results.logging.consoleLogs.length;
results.logging.totalCount = results.logging.consoleLogs.length; // Same as critical since we only scan critical paths
results.logging.topOffendingFiles = topOffendingFiles;

// Add errors to results
results.errors = errors;

// Write outputs
import { writeFileSync } from 'fs';

// Write JSON output
writeFileSync('docs/audit/observability.json', JSON.stringify(results, null, 2));

// Write Markdown output
const mdContent = `# Observability Report

Generated: ${results.timestamp}

## Scanning Summary
- **Critical Paths Scanned**: ${results.scanning.criticalPaths.join(', ')}
- **Total Files Found**: ${results.scanning.totalFilesScanned}
- **Files Processed**: ${results.scanning.criticalFilesScanned}

## Console.log Analysis
- **Critical Count**: ${results.logging.criticalCount}
- **Total Count**: ${results.logging.totalCount}

### Top Offending Files
${results.logging.topOffendingFiles.map(({ file, count }) => `- **${file}**: ${count} statements`).join('\n')}

### All Console.log Statements in Critical Paths
${results.logging.consoleLogs.map(log => `
- **File**: \`${log.file}:${log.line}\`
- **Content**: \`${log.content}\`
`).join('\n')}

## Request ID Management
### Generation (${results.requestId.generation.length})
${results.requestId.generation.map(gen => `
- **File**: \`${gen.file}:${gen.line}\`
- **Pattern**: \`${gen.pattern}\`
- **Content**: \`${gen.content}\`
`).join('\n')}

### Propagation (${results.requestId.propagation.length})
${results.requestId.propagation.map(prop => `
- **File**: \`${prop.file}:${prop.line}\`
- **Pattern**: \`${prop.pattern}\`
- **Content**: \`${prop.content}\`
`).join('\n')}

### Usage (${results.requestId.usage.length})
${results.requestId.usage.map(usage => `
- **File**: \`${usage.file}:${usage.line}\`
- **Pattern**: \`${usage.pattern}\`
- **Content**: \`${usage.content}\`
`).join('\n')}

## Logging Configuration
- **Structured Logging**: ${results.logging.structured ? '✅ Implemented' : '❌ Not implemented'}
- **Central Logger**: ${results.logging.centralLogger ? '✅ Implemented' : '❌ Not implemented'}
- **New Logger**: ${results.logging.hasNewLogger ? '✅ Implemented' : '❌ Not implemented'}

## Tracing Configuration
### Spans (${results.tracing.spans.length})
${results.tracing.spans.map(span => `
- **File**: \`${span.file}:${span.line}\`
- **Pattern**: \`${span.pattern}\`
- **Content**: \`${span.content}\`
`).join('\n')}

### Context (${results.tracing.context.length})
${results.tracing.context.map(ctx => `
- **File**: \`${ctx.file}:${ctx.line}\`
- **Pattern**: \`${ctx.pattern}\`
- **Content**: \`${ctx.content}\`
`).join('\n')}

## Summary
- **Files Scanned**: ${results.scanning.criticalFilesScanned}
- **Console.log in Critical Paths**: ${results.logging.criticalCount}
- **Request ID Generation**: ${results.requestId.generation.length}
- **Request ID Propagation**: ${results.requestId.propagation.length}
- **Request ID Usage**: ${results.requestId.usage.length}
- **Structured Logging**: ${results.logging.structured ? 'Yes' : 'No'}
- **Central Logger**: ${results.logging.centralLogger ? 'Yes' : 'No'}
- **New Logger**: ${results.logging.hasNewLogger ? 'Yes' : 'No'}
- **Tracing Spans**: ${results.tracing.spans.length}
- **Tracing Context**: ${results.tracing.context.length}

## Recommendations
${results.requestId.generation.length === 0 ? '- ❌ **Implement request ID generation** for request tracing' : ''}
${results.requestId.propagation.length === 0 ? '- ❌ **Implement request ID propagation** across services' : ''}
${!results.logging.structured ? '- ❌ **Implement structured logging** for better observability' : ''}
${!results.logging.centralLogger ? '- ⚠️ **Consider central logger** for consistent logging' : ''}
${results.logging.criticalCount > 0 ? `- ⚠️ **Replace ${results.logging.criticalCount} console.log statements in critical paths** with structured logging` : ''}
${results.tracing.spans.length === 0 ? '- ⚠️ **Consider implementing tracing spans** for performance monitoring' : ''}

${errors.length > 0 ? `
## Errors
${errors.map(error => `- ❌ ${error}`).join('\n')}
` : ''}
`;

writeFileSync('docs/audit/observability.md', mdContent);

console.log('✅ Observability audit complete');
console.log(`📄 JSON: docs/audit/observability.json`);
console.log(`📄 Markdown: docs/audit/observability.md`);
