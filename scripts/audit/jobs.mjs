#!/usr/bin/env node

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, relative } from 'path';

const errors = [];
const results = {
  timestamp: new Date().toISOString(),
  jobs: [],
  cronHandlers: [],
  queueHandlers: [],
  schedulers: [],
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

// Helper to extract job information
function extractJobInfo(content, filePath) {
  const jobs = [];
  const lines = content.split('\n');
  
  // Look for job definitions
  const jobPatterns = [
    /export\s+(?:const|function)\s+(\w*[Jj]ob\w*)/g,
    /export\s+(?:const|function)\s+(\w*[Tt]ask\w*)/g,
    /export\s+(?:const|function)\s+(\w*[Ww]orker\w*)/g,
    /export\s+(?:const|function)\s+(\w*[Hh]andler\w*)/g
  ];
  
  for (const pattern of jobPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const jobName = match[1];
      const lineNum = content.substring(0, match.index).split('\n').length;
      
      // Extract job metadata
      const job = {
        name: jobName,
        file: relative('src', filePath),
        line: lineNum,
        type: 'job',
        trigger: 'unknown',
        batchSize: null,
        retry: null,
        backoff: null,
        dedupe: null,
        sideEffects: []
      };
      
      // Look for trigger patterns
      const triggerPatterns = [
        { pattern: /cron\s*\(\s*['"`]([^'"`]+)['"`]/, type: 'cron' },
        { pattern: /interval\s*\(\s*(\d+)/, type: 'interval' },
        { pattern: /schedule\s*\(\s*['"`]([^'"`]+)['"`]/, type: 'schedule' },
        { pattern: /webhook\s*\(\s*['"`]([^'"`]+)['"`]/, type: 'webhook' }
      ];
      
      for (const trigger of triggerPatterns) {
        const triggerMatch = content.match(trigger.pattern);
        if (triggerMatch) {
          job.trigger = `${trigger.type}: ${triggerMatch[1]}`;
          break;
        }
      }
      
      // Look for batch size
      const batchMatch = content.match(/batch(?:Size)?\s*[=:]\s*(\d+)/i);
      if (batchMatch) {
        job.batchSize = parseInt(batchMatch[1]);
      }
      
      // Look for retry configuration
      const retryMatch = content.match(/retry\s*[=:]\s*(\d+)/i);
      if (retryMatch) {
        job.retry = parseInt(retryMatch[1]);
      }
      
      // Look for backoff configuration
      const backoffMatch = content.match(/backoff\s*[=:]\s*['"`]?(\w+)['"`]?/i);
      if (backoffMatch) {
        job.backoff = backoffMatch[1];
      }
      
      // Look for deduplication
      const dedupeMatch = content.match(/dedupe|deduplication/i);
      if (dedupeMatch) {
        job.dedupe = true;
      }
      
      // Look for side effects
      const sideEffectPatterns = [
        /email|sendgrid|resend/i,
        /prisma\.\w+\.(create|update|delete)/,
        /fetch\s*\(\s*['"`]https?:\/\//,
        /webhook|callback/i
      ];
      
      for (const pattern of sideEffectPatterns) {
        if (pattern.test(content)) {
          job.sideEffects.push(pattern.source);
        }
      }
      
      jobs.push(job);
    }
  }
  
  return jobs;
}

// Helper to extract cron handler info
function extractCronHandler(content, filePath) {
  const handlers = [];
  const lines = content.split('\n');
  
  // Look for cron handler patterns
  const cronPatterns = [
    /export\s+(?:const|function)\s+(GET|POST)\s*=/g,
    /export\s+(?:const|function)\s+(\w*[Cc]ron\w*)/g
  ];
  
  for (const pattern of cronPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const handlerName = match[1];
      const lineNum = content.substring(0, match.index).split('\n').length;
      
      const handler = {
        name: handlerName,
        file: relative('src', filePath),
        line: lineNum,
        type: 'cron',
        method: handlerName.match(/^(GET|POST)$/) ? handlerName : 'unknown',
        schedule: 'unknown',
        retry: null,
        sideEffects: []
      };
      
      // Look for schedule information
      const scheduleMatch = content.match(/schedule\s*[=:]\s*['"`]([^'"`]+)['"`]/i);
      if (scheduleMatch) {
        handler.schedule = scheduleMatch[1];
      }
      
      // Look for retry configuration
      const retryMatch = content.match(/retry\s*[=:]\s*(\d+)/i);
      if (retryMatch) {
        handler.retry = parseInt(retryMatch[1]);
      }
      
      // Look for side effects
      const sideEffectPatterns = [
        /email|sendgrid|resend/i,
        /prisma\.\w+\.(create|update|delete)/,
        /fetch\s*\(\s*['"`]https?:\/\//,
        /webhook|callback/i
      ];
      
      for (const pattern of sideEffectPatterns) {
        if (pattern.test(content)) {
          handler.sideEffects.push(pattern.source);
        }
      }
      
      handlers.push(handler);
    }
  }
  
  return handlers;
}

// Helper to extract queue handler info
function extractQueueHandler(content, filePath) {
  const handlers = [];
  const lines = content.split('\n');
  
  // Look for queue handler patterns
  const queuePatterns = [
    /export\s+(?:const|function)\s+(\w*[Qq]ueue\w*)/g,
    /export\s+(?:const|function)\s+(\w*[Pp]rocess\w*)/g
  ];
  
  for (const pattern of queuePatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const handlerName = match[1];
      const lineNum = content.substring(0, match.index).split('\n').length;
      
      const handler = {
        name: handlerName,
        file: relative('src', filePath),
        line: lineNum,
        type: 'queue',
        batchSize: null,
        retry: null,
        backoff: null,
        sideEffects: []
      };
      
      // Look for batch size
      const batchMatch = content.match(/batch(?:Size)?\s*[=:]\s*(\d+)/i);
      if (batchMatch) {
        handler.batchSize = parseInt(batchMatch[1]);
      }
      
      // Look for retry configuration
      const retryMatch = content.match(/retry\s*[=:]\s*(\d+)/i);
      if (retryMatch) {
        handler.retry = parseInt(retryMatch[1]);
      }
      
      // Look for backoff configuration
      const backoffMatch = content.match(/backoff\s*[=:]\s*['"`]?(\w+)['"`]?/i);
      if (backoffMatch) {
        handler.backoff = backoffMatch[1];
      }
      
      // Look for side effects
      const sideEffectPatterns = [
        /email|sendgrid|resend/i,
        /prisma\.\w+\.(create|update|delete)/,
        /fetch\s*\(\s*['"`]https?:\/\//,
        /webhook|callback/i
      ];
      
      for (const pattern of sideEffectPatterns) {
        if (pattern.test(content)) {
          handler.sideEffects.push(pattern.source);
        }
      }
      
      handlers.push(handler);
    }
  }
  
  return handlers;
}

// Helper to extract scheduler info
function extractScheduler(content, filePath) {
  const schedulers = [];
  const lines = content.split('\n');
  
  // Look for scheduler patterns
  const schedulerPatterns = [
    /export\s+(?:const|function)\s+(\w*[Ss]cheduler\w*)/g,
    /export\s+(?:const|function)\s+(\w*[Tt]imer\w*)/g
  ];
  
  for (const pattern of schedulerPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const schedulerName = match[1];
      const lineNum = content.substring(0, match.index).split('\n').length;
      
      const scheduler = {
        name: schedulerName,
        file: relative('src', filePath),
        line: lineNum,
        type: 'scheduler',
        jobs: [],
        retry: null,
        sideEffects: []
      };
      
      // Look for scheduled jobs
      const jobMatches = content.match(/schedule\s*\(\s*['"`](\w+)['"`]/g);
      if (jobMatches) {
        scheduler.jobs = jobMatches.map(match => 
          match.match(/['"`](\w+)['"`]/)[1]
        );
      }
      
      // Look for retry configuration
      const retryMatch = content.match(/retry\s*[=:]\s*(\d+)/i);
      if (retryMatch) {
        scheduler.retry = parseInt(retryMatch[1]);
      }
      
      // Look for side effects
      const sideEffectPatterns = [
        /email|sendgrid|resend/i,
        /prisma\.\w+\.(create|update|delete)/,
        /fetch\s*\(\s*['"`]https?:\/\//,
        /webhook|callback/i
      ];
      
      for (const pattern of sideEffectPatterns) {
        if (pattern.test(content)) {
          scheduler.sideEffects.push(pattern.source);
        }
      }
      
      schedulers.push(scheduler);
    }
  }
  
  return schedulers;
}

// Scan for jobs in lib/jobs
console.log('🔍 Scanning lib/jobs for job definitions...');
const jobFiles = findFiles('src/lib/jobs', /\.(ts|tsx)$/);

for (const filePath of jobFiles) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const jobs = extractJobInfo(content, filePath);
    results.jobs.push(...jobs);
  } catch (error) {
    errors.push(`Error reading ${filePath}: ${error.message}`);
  }
}

// Scan for cron handlers
console.log('🔍 Scanning API cron handlers...');
const cronFiles = findFiles('src/app/api/cron', /\.(ts|tsx)$/);

for (const filePath of cronFiles) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const handlers = extractCronHandler(content, filePath);
    results.cronHandlers.push(...handlers);
  } catch (error) {
    errors.push(`Error reading ${filePath}: ${error.message}`);
  }
}

// Scan for queue handlers
console.log('🔍 Scanning queue handlers...');
const queueFiles = findFiles('src/app/api/outreach/queue', /\.(ts|tsx)$/);

for (const filePath of queueFiles) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const handlers = extractQueueHandler(content, filePath);
    results.queueHandlers.push(...handlers);
  } catch (error) {
    errors.push(`Error reading ${filePath}: ${error.message}`);
  }
}

// Scan for schedulers
console.log('🔍 Scanning scheduler files...');
const schedulerFiles = findFiles('src/lib', /scheduler\.(ts|tsx)$/);

for (const filePath of schedulerFiles) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const schedulers = extractScheduler(content, filePath);
    results.schedulers.push(...schedulers);
  } catch (error) {
    errors.push(`Error reading ${filePath}: ${error.message}`);
  }
}

// Add errors to results
results.errors = errors;

// Write outputs
import { writeFileSync } from 'fs';

// Write JSON output
writeFileSync('docs/audit/jobs.json', JSON.stringify(results, null, 2));

// Write Markdown output
const mdContent = `# Jobs & Cron Handlers Report

Generated: ${results.timestamp}

## Job Definitions (${results.jobs.length})
${results.jobs.map(job => `
### ${job.name}
- **File**: \`${job.file}:${job.line}\`
- **Type**: ${job.type}
- **Trigger**: ${job.trigger}
- **Batch Size**: ${job.batchSize || 'Not specified'}
- **Retry**: ${job.retry || 'Not specified'}
- **Backoff**: ${job.backoff || 'Not specified'}
- **Deduplication**: ${job.dedupe ? '✅ Enabled' : '❌ Not enabled'}
- **Side Effects**: ${job.sideEffects.length > 0 ? job.sideEffects.join(', ') : 'None detected'}
`).join('\n')}

## Cron Handlers (${results.cronHandlers.length})
${results.cronHandlers.map(handler => `
### ${handler.name}
- **File**: \`${handler.file}:${handler.line}\`
- **Type**: ${handler.type}
- **Method**: ${handler.method}
- **Schedule**: ${handler.schedule}
- **Retry**: ${handler.retry || 'Not specified'}
- **Side Effects**: ${handler.sideEffects.length > 0 ? handler.sideEffects.join(', ') : 'None detected'}
`).join('\n')}

## Queue Handlers (${results.queueHandlers.length})
${results.queueHandlers.map(handler => `
### ${handler.name}
- **File**: \`${handler.file}:${handler.line}\`
- **Type**: ${handler.type}
- **Batch Size**: ${handler.batchSize || 'Not specified'}
- **Retry**: ${handler.retry || 'Not specified'}
- **Backoff**: ${handler.backoff || 'Not specified'}
- **Side Effects**: ${handler.sideEffects.length > 0 ? handler.sideEffects.join(', ') : 'None detected'}
`).join('\n')}

## Schedulers (${results.schedulers.length})
${results.schedulers.map(scheduler => `
### ${scheduler.name}
- **File**: \`${scheduler.file}:${scheduler.line}\`
- **Type**: ${scheduler.type}
- **Jobs**: ${scheduler.jobs.length > 0 ? scheduler.jobs.join(', ') : 'None detected'}
- **Retry**: ${scheduler.retry || 'Not specified'}
- **Side Effects**: ${scheduler.sideEffects.length > 0 ? scheduler.sideEffects.join(', ') : 'None detected'}
`).join('\n')}

## Summary
- **Total Jobs**: ${results.jobs.length}
- **Total Cron Handlers**: ${results.cronHandlers.length}
- **Total Queue Handlers**: ${results.queueHandlers.length}
- **Total Schedulers**: ${results.schedulers.length}
- **Jobs with Retry**: ${results.jobs.filter(j => j.retry).length}
- **Jobs with Deduplication**: ${results.jobs.filter(j => j.dedupe).length}
- **Handlers with Side Effects**: ${[...results.jobs, ...results.cronHandlers, ...results.queueHandlers, ...results.schedulers].filter(h => h.sideEffects.length > 0).length}

## Recommendations
${results.jobs.filter(j => !j.retry).length > 0 ? `
- ⚠️ **${results.jobs.filter(j => !j.retry).length} jobs** lack retry configuration
` : ''}
${results.jobs.filter(j => !j.dedupe).length > 0 ? `
- ⚠️ **${results.jobs.filter(j => !j.dedupe).length} jobs** lack deduplication
` : ''}
${results.jobs.filter(j => j.sideEffects.length === 0).length > 0 ? `
- ⚠️ **${results.jobs.filter(j => j.sideEffects.length === 0).length} jobs** have no detectable side effects
` : ''}

${errors.length > 0 ? `
## Errors
${errors.map(error => `- ❌ ${error}`).join('\n')}
` : ''}
`;

writeFileSync('docs/audit/jobs.md', mdContent);

console.log('✅ Jobs audit complete');
console.log(`📄 JSON: docs/audit/jobs.json`);
console.log(`📄 Markdown: docs/audit/jobs.md`);
