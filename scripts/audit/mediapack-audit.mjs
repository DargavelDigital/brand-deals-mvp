#!/usr/bin/env node

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, relative } from 'path';

const errors = [];
const results = {
  timestamp: new Date().toISOString(),
  puppeteer: {
    config: {},
    launchOptions: {},
    timeouts: {},
    memory: {}
  },
  storage: {
    local: false,
    s3: false,
    signedUrls: false
  },
  analytics: {
    events: [],
    retry: false
  },
  netlify: {
    binarySelection: false,
    fallback: false
  },
  chromium: {
    resolver: false,
    stubPath: false,
    fallback: false,
    importPattern: false,
    namedImport: false
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

// Helper to extract Puppeteer configuration
function extractPuppeteerConfig(content, filePath) {
  const config = {
    executablePath: null,
    args: [],
    timeout: null,
    memory: null,
    headless: null
  };
  
  // Look for executable path
  const executableMatch = content.match(/executablePath\s*[=:]\s*['"`]([^'"`]+)['"`]/);
  if (executableMatch) {
    config.executablePath = executableMatch[1];
  }
  
  // Look for args
  const argsMatch = content.match(/args\s*[=:]\s*\[([^\]]+)\]/);
  if (argsMatch) {
    config.args = argsMatch[1].split(',').map(arg => arg.trim().replace(/['"`]/g, ''));
  }
  
  // Look for timeout
  const timeoutMatch = content.match(/timeout\s*[=:]\s*(\d+)/);
  if (timeoutMatch) {
    config.timeout = parseInt(timeoutMatch[1]);
  }
  
  // Look for memory settings
  const memoryMatch = content.match(/memory\s*[=:]\s*(\d+)/);
  if (memoryMatch) {
    config.memory = parseInt(memoryMatch[1]);
  }
  
  // Look for headless setting
  const headlessMatch = content.match(/headless\s*[=:]\s*(true|false)/);
  if (headlessMatch) {
    config.headless = headlessMatch[1] === 'true';
  }
  
  return config;
}

// Helper to check storage configuration
function checkStorageConfig(content, filePath) {
  const storage = {
    local: false,
    s3: false,
    signedUrls: false
  };
  
  // Check for local storage
  const localPatterns = [
    /local.*storage/i,
    /file.*system/i,
    /fs\.writeFile/i,
    /writeFileSync/i
  ];
  
  storage.local = localPatterns.some(pattern => pattern.test(content));
  
  // Check for S3 storage
  const s3Patterns = [
    /aws.*s3/i,
    /@aws-sdk/i,
    /s3.*upload/i,
    /s3.*putObject/i
  ];
  
  storage.s3 = s3Patterns.some(pattern => pattern.test(content));
  
  // Check for signed URLs
  const signedUrlPatterns = [
    /signed.*url/i,
    /presigned.*url/i,
    /getSignedUrl/i,
    /generatePresignedUrl/i
  ];
  
  storage.signedUrls = signedUrlPatterns.some(pattern => pattern.test(content));
  
  return storage;
}

// Helper to extract analytics events
function extractAnalyticsEvents(content, filePath) {
  const events = [];
  const lines = content.split('\n');
  
  // Look for analytics event patterns
  const eventPatterns = [
    { name: 'View', pattern: /view.*event|event.*view/i },
    { name: 'Click', pattern: /click.*event|event.*click/i },
    { name: 'Conversion', pattern: /conversion.*event|event.*conversion/i },
    { name: 'Error', pattern: /error.*event|event.*error/i }
  ];
  
  for (const event of eventPatterns) {
    if (event.pattern.test(content)) {
      const lineNum = content.search(event.pattern);
      const line = content.substring(0, lineNum).split('\n').length;
      
      events.push({
        name: event.name,
        file: relative('src', filePath),
        line: line
      });
    }
  }
  
  return events;
}

// Helper to check retry behavior
function checkRetryBehavior(content, filePath) {
  const retryPatterns = [
    /retry/i,
    /retry.*logic/i,
    /retry.*attempt/i,
    /max.*retries/i
  ];
  
  return retryPatterns.some(pattern => pattern.test(content));
}

// Helper to check Netlify-specific configuration
function checkNetlifyConfig(content, filePath) {
  const netlify = {
    binarySelection: false,
    fallback: false
  };
  
  // Check for binary selection
  const binaryPatterns = [
    /netlify.*binary/i,
    /binary.*selection/i,
    /chromium.*binary/i,
    /executable.*path/i
  ];
  
  netlify.binarySelection = binaryPatterns.some(pattern => pattern.test(content));
  
  // Check for fallback behavior
  const fallbackPatterns = [
    /fallback/i,
    /dev.*fallback/i,
    /chromium.*not.*found/i,
    /executable.*not.*found/i
  ];
  
  netlify.fallback = fallbackPatterns.some(pattern => pattern.test(content));
  
  return netlify;
}

// Helper to check Chromium resolver and stub path
function checkChromiumResolver(content, filePath) {
  const chromium = {
    resolver: false,
    stubPath: false,
    fallback: false,
    importPattern: false,
    namedImport: false
  };
  
  // Look for Chromium resolver patterns
  const resolverPatterns = [
    /getChromium/i,
    /chromium\.ts/i,
    /@\/lib\/chromium/i,
    /CHROME_EXECUTABLE_PATH/i,
    /@sparticuz\/chromium/i
  ];
  
  chromium.resolver = resolverPatterns.some(pattern => pattern.test(content));
  
  // Look for specific import pattern: from "@/lib/chromium"
  const importPattern = /from\s+["']@\/lib\/chromium["']/i;
  chromium.importPattern = importPattern.test(content);
  
  // Look for named import: getChromium
  const namedImportPattern = /import\s*\{\s*[^}]*getChromium[^}]*\}\s*from\s+["']@\/lib\/chromium["']/i;
  chromium.namedImport = namedImportPattern.test(content);
  
  // Look for stub PDF patterns
  const stubPatterns = [
    /stub.*pdf/i,
    /generateStubPDF/i,
    /stub-pdf\.ts/i,
    /@\/lib\/stub-pdf/i,
    /DEMO.*PREVIEW.*ONLY/i
  ];
  
  chromium.stubPath = stubPatterns.some(pattern => pattern.test(content));
  
  // Look for fallback patterns
  const fallbackPatterns = [
    /fallback/i,
    /catch.*error/i,
    /try.*catch/i,
    /PDF_RENDER_FAILED/i
  ];
  
  chromium.fallback = fallbackPatterns.some(pattern => pattern.test(content));
  
  return chromium;
}

// Scan for mediapack-related files
console.log('🔍 Scanning for mediapack-related files...');
const mediapackFiles = findFiles('src', /\.(ts|tsx)$/);

for (const filePath of mediapackFiles) {
  try {
    const content = readFileSync(filePath, 'utf8');
    
    // Check if file contains mediapack-related code OR is in lib directory
    if (content.match(/puppeteer|chromium|mediapack|pdf|screenshot/i) || filePath.includes('/lib/')) {
      const puppeteerConfig = extractPuppeteerConfig(content, filePath);
      const storage = checkStorageConfig(content, filePath);
      const events = extractAnalyticsEvents(content, filePath);
      const retry = checkRetryBehavior(content, filePath);
      const netlify = checkNetlifyConfig(content, filePath);
      const chromium = checkChromiumResolver(content, filePath);
      
      // Merge configurations
      Object.assign(results.puppeteer.config, puppeteerConfig);
      Object.assign(results.storage, storage);
      results.analytics.events.push(...events);
      if (retry) {
        results.analytics.retry = true;
      }
      Object.assign(results.netlify, netlify);
      
      // Direct assignment instead of Object.assign
      results.chromium.resolver = chromium.resolver || results.chromium.resolver;
      results.chromium.stubPath = chromium.stubPath || results.chromium.stubPath;
      results.chromium.fallback = chromium.fallback || results.chromium.fallback;
      results.chromium.importPattern = chromium.importPattern || results.chromium.importPattern;
      results.chromium.namedImport = chromium.namedImport || results.chromium.namedImport;
    }
  } catch (error) {
    errors.push(`Error reading ${filePath}: ${error.message}`);
  }
}

// Check for specific mediapack service files
console.log('🔍 Checking for mediapack service files...');
const mediapackServiceFiles = [
  'src/services/mediapack',
  'src/lib/mediapack',
  'src/app/api/mediapack'
];

for (const serviceDir of mediapackServiceFiles) {
  if (existsSync(serviceDir)) {
    const serviceFiles = findFiles(serviceDir, /\.(ts|tsx)$/);
    for (const filePath of serviceFiles) {
      try {
        const content = readFileSync(filePath, 'utf8');
        const puppeteerConfig = extractPuppeteerConfig(content, filePath);
        const storage = checkStorageConfig(content, filePath);
        const events = extractAnalyticsEvents(content, filePath);
        const retry = checkRetryBehavior(content, filePath);
        const netlify = checkNetlifyConfig(content, filePath);
        const chromium = checkChromiumResolver(content, filePath);
        
        // Merge configurations
        Object.assign(results.puppeteer.config, puppeteerConfig);
        Object.assign(results.storage, storage);
        results.analytics.events.push(...events);
        if (retry) {
          results.analytics.retry = true;
        }
        Object.assign(results.netlify, netlify);
        
        // Direct assignment instead of Object.assign
        results.chromium.resolver = chromium.resolver || results.chromium.resolver;
        results.chromium.stubPath = chromium.stubPath || results.chromium.stubPath;
        results.chromium.fallback = chromium.fallback || results.chromium.fallback;
        results.chromium.importPattern = chromium.importPattern || results.chromium.importPattern;
        results.chromium.namedImport = chromium.namedImport || results.chromium.namedImport;
        
      } catch (error) {
        errors.push(`Error reading ${filePath}: ${error.message}`);
      }
    }
  }
}

// Check for environment variables
console.log('🔍 Checking mediapack environment variables...');
const mediapackEnvVars = [
  'PUPPETEER_EXECUTABLE_PATH',
  'CHROMIUM_EXECUTABLE_PATH',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_S3_BUCKET',
  'S3_BUCKET_NAME'
];

results.envVars = {};
for (const envVar of mediapackEnvVars) {
  results.envVars[envVar] = process.env[envVar] ? 'SET' : 'NOT_SET';
}

// Test debug endpoint
console.log('🔍 Testing debug endpoint...');
async function testDebugEndpoint() {
  try {
    // Use built-in fetch (Node.js 18+) or fallback to curl
    if (typeof fetch !== 'undefined') {
      const response = await fetch('http://localhost:3000/api/debug/chromium');
      const data = await response.json();
      
      return {
        success: true,
        status: response.status,
        data: data
      };
    } else {
      // Fallback to curl command
      const { execSync } = await import('child_process');
      const curlOutput = execSync('curl -s http://localhost:3000/api/debug/chromium', { encoding: 'utf8' });
      const data = JSON.parse(curlOutput);
      
      return {
        success: true,
        status: 200,
        data: data
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Test debug endpoint if we're in a development environment
if (process.env.NODE_ENV !== 'production') {
  const debugResult = await testDebugEndpoint();
  results.debugEndpoint = debugResult;
} else {
  results.debugEndpoint = {
    success: false,
    error: 'Skipped in production environment'
  };
}

// Add errors to results
results.errors = errors;


// Write outputs
import { writeFileSync } from 'fs';

// Write JSON output
writeFileSync('docs/audit/mediapack-audit.json', JSON.stringify(results, null, 2));

// Write Markdown output
const mdContent = `# MediaPack Audit Report

Generated: ${results.timestamp}

## Puppeteer Configuration
- **Executable Path**: ${results.puppeteer.config.executablePath || 'Not specified'}
- **Args**: ${results.puppeteer.config.args.length > 0 ? results.puppeteer.config.args.join(', ') : 'Not specified'}
- **Timeout**: ${results.puppeteer.config.timeout || 'Not specified'}
- **Memory**: ${results.puppeteer.config.memory || 'Not specified'}
- **Headless**: ${results.puppeteer.config.headless !== null ? (results.puppeteer.config.headless ? 'Yes' : 'No') : 'Not specified'}

## Storage Configuration
- **Local Storage**: ${results.storage.local ? '✅ Enabled' : '❌ Not enabled'}
- **S3 Storage**: ${results.storage.s3 ? '✅ Enabled' : '❌ Not enabled'}
- **Signed URLs**: ${results.storage.signedUrls ? '✅ Enabled' : '❌ Not enabled'}

## Analytics Events (${results.analytics.events.length})
${results.analytics.events.map(event => `
### ${event.name}
- **File**: \`${event.file}:${event.line}\`
`).join('\n')}

## Analytics Configuration
- **Retry Behavior**: ${results.analytics.retry ? '✅ Implemented' : '❌ Not implemented'}

## Netlify Configuration
- **Binary Selection**: ${results.netlify.binarySelection ? '✅ Implemented' : '❌ Not implemented'}
- **Fallback Behavior**: ${results.netlify.fallback ? '✅ Implemented' : '❌ Not implemented'}

## Environment Variables
${Object.entries(results.envVars).map(([key, value]) => `- **${key}**: ${value === 'SET' ? '✅ Set' : '❌ Not set'}`).join('\n')}

## Summary
- **Puppeteer Configured**: ${Object.values(results.puppeteer.config).some(v => v !== null) ? 'Yes' : 'No'}
- **Storage Options**: ${Object.values(results.storage).filter(Boolean).length}/3
- **Analytics Events**: ${results.analytics.events.length}
- **Retry Behavior**: ${results.analytics.retry ? 'Yes' : 'No'}
- **Netlify Ready**: ${results.netlify.binarySelection && results.netlify.fallback ? 'Yes' : 'No'}

## Recommendations
${!results.puppeteer.config.executablePath ? '- ⚠️ **Specify executable path** for consistent Chromium usage' : ''}
${!results.puppeteer.config.timeout ? '- ⚠️ **Set timeout values** to prevent hanging processes' : ''}
${!results.puppeteer.config.memory ? '- ⚠️ **Configure memory limits** for serverless environments' : ''}
${!results.storage.s3 ? '- ⚠️ **Consider S3 storage** for production scalability' : ''}
${!results.storage.signedUrls ? '- ⚠️ **Implement signed URLs** for secure file access' : ''}
${!results.analytics.retry ? '- ⚠️ **Implement retry logic** for analytics events' : ''}
${!results.netlify.binarySelection ? '- ❌ **Implement binary selection** for Netlify deployment' : ''}
${!results.netlify.fallback ? '- ❌ **Implement fallback behavior** for development' : ''}

${errors.length > 0 ? `
## Errors
${errors.map(error => `- ❌ ${error}`).join('\n')}
` : ''}
`;

writeFileSync('docs/audit/mediapack-audit.md', mdContent);

console.log('✅ MediaPack audit complete');
console.log(`📄 JSON: docs/audit/mediapack-audit.json`);
console.log(`📄 Markdown: docs/audit/mediapack-audit.md`);
