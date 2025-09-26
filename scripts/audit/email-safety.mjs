#!/usr/bin/env node

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, relative } from 'path';

const errors = [];
const results = {
  timestamp: new Date().toISOString(),
  providers: [],
  safety: {
    unsubscribe: false,
    footer: false,
    fromReplyTo: false,
    dailyCaps: false,
    domainGuards: false,
    suppression: false
  },
  config: {},
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

// Helper to extract email provider information
function extractEmailProviders(content, filePath) {
  const providers = [];
  const lines = content.split('\n');
  
  // Look for email provider imports and usage
  const providerPatterns = [
    { name: 'Resend', pattern: /resend|@resend/i },
    { name: 'SendGrid', pattern: /@sendgrid|sendgrid/i },
    { name: 'SMTP', pattern: /nodemailer|smtp/i },
    { name: 'Blackhole', pattern: /blackhole|dev.*email|test.*email/i }
  ];
  
  for (const provider of providerPatterns) {
    if (provider.pattern.test(content)) {
      const lineNum = content.search(provider.pattern);
      const line = content.substring(0, lineNum).split('\n').length;
      
      providers.push({
        name: provider.name,
        file: relative('src', filePath),
        line: line,
        detected: true
      });
    }
  }
  
  return providers;
}

// Helper to check email safety features
function checkEmailSafety(content, filePath) {
  const safety = {
    unsubscribe: false,
    footer: false,
    fromReplyTo: false,
    dailyCaps: false,
    domainGuards: false,
    suppression: false
  };
  
  // Check for unsubscribe handling
  const unsubscribePatterns = [
    /unsubscribe/i,
    /opt.?out/i,
    /remove.*email/i,
    /email.*preferences/i
  ];
  
  safety.unsubscribe = unsubscribePatterns.some(pattern => pattern.test(content));
  
  // Check for footer handling
  const footerPatterns = [
    /footer/i,
    /signature/i,
    /company.*info/i,
    /contact.*info/i
  ];
  
  safety.footer = footerPatterns.some(pattern => pattern.test(content));
  
  // Check for from/reply-to handling
  const fromReplyToPatterns = [
    /from.*email/i,
    /reply.*to/i,
    /sender.*email/i,
    /return.*path/i
  ];
  
  safety.fromReplyTo = fromReplyToPatterns.some(pattern => pattern.test(content));
  
  // Check for daily caps
  const dailyCapPatterns = [
    /daily.*cap/i,
    /email.*limit/i,
    /rate.*limit/i,
    /emailDailyUsed/i,
    /max.*emails/i
  ];
  
  safety.dailyCaps = dailyCapPatterns.some(pattern => pattern.test(content));
  
  // Check for domain guards
  const domainGuardPatterns = [
    /domain.*guard/i,
    /allowlist/i,
    /whitelist/i,
    /dev.*domain/i,
    /test.*domain/i,
    /localhost/i,
    /127\.0\.0\.1/i
  ];
  
  safety.domainGuards = domainGuardPatterns.some(pattern => pattern.test(content));
  
  // Check for suppression handling
  const suppressionPatterns = [
    /suppression/i,
    /bounce.*handling/i,
    /complaint/i,
    /unsubscribe.*list/i,
    /blacklist/i
  ];
  
  safety.suppression = suppressionPatterns.some(pattern => pattern.test(content));
  
  return safety;
}

// Helper to extract email configuration
function extractEmailConfig(content, filePath) {
  const config = {};
  
  // Look for email configuration
  const configPatterns = [
    { key: 'fromEmail', pattern: /from.*email\s*[=:]\s*['"`]([^'"`]+)['"`]/i },
    { key: 'replyTo', pattern: /reply.*to\s*[=:]\s*['"`]([^'"`]+)['"`]/i },
    { key: 'dailyLimit', pattern: /daily.*limit\s*[=:]\s*(\d+)/i },
    { key: 'rateLimit', pattern: /rate.*limit\s*[=:]\s*(\d+)/i },
    { key: 'batchSize', pattern: /batch.*size\s*[=:]\s*(\d+)/i }
  ];
  
  for (const configPattern of configPatterns) {
    const match = content.match(configPattern.pattern);
    if (match) {
      config[configPattern.key] = match[1];
    }
  }
  
  return config;
}

// Scan for email-related files
console.log('🔍 Scanning for email-related files...');
const emailFiles = findFiles('src', /\.(ts|tsx)$/);

for (const filePath of emailFiles) {
  try {
    const content = readFileSync(filePath, 'utf8');
    
    // Check if file contains email-related code
    if (content.match(/email|sendgrid|resend|nodemailer/i)) {
      const providers = extractEmailProviders(content, filePath);
      const safety = checkEmailSafety(content, filePath);
      const config = extractEmailConfig(content, filePath);
      
      results.providers.push(...providers);
      
      // Update overall safety status
      Object.keys(safety).forEach(key => {
        if (safety[key]) {
          results.safety[key] = true;
        }
      });
      
      // Merge config
      Object.assign(results.config, config);
    }
  } catch (error) {
    errors.push(`Error reading ${filePath}: ${error.message}`);
  }
}

// Check for specific email service files
console.log('🔍 Checking for email service files...');
const emailServiceFiles = [
  'src/services/email',
  'src/lib/email',
  'src/app/api/email'
];

for (const serviceDir of emailServiceFiles) {
  if (existsSync(serviceDir)) {
    const serviceFiles = findFiles(serviceDir, /\.(ts|tsx)$/);
    for (const filePath of serviceFiles) {
      try {
        const content = readFileSync(filePath, 'utf8');
        const providers = extractEmailProviders(content, filePath);
        const safety = checkEmailSafety(content, filePath);
        const config = extractEmailConfig(content, filePath);
        
        results.providers.push(...providers);
        
        // Update overall safety status
        Object.keys(safety).forEach(key => {
          if (safety[key]) {
            results.safety[key] = true;
          }
        });
        
        // Merge config
        Object.assign(results.config, config);
      } catch (error) {
        errors.push(`Error reading ${filePath}: ${error.message}`);
      }
    }
  }
}

// Check for environment variables related to email
console.log('🔍 Checking email environment variables...');
const emailEnvVars = [
  'RESEND_API_KEY',
  'SENDGRID_API_KEY',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'EMAIL_FROM',
  'EMAIL_REPLY_TO'
];

results.envVars = {};
for (const envVar of emailEnvVars) {
  results.envVars[envVar] = process.env[envVar] ? 'SET' : 'NOT_SET';
}

// Add errors to results
results.errors = errors;

// Write outputs
import { writeFileSync } from 'fs';

// Write JSON output
writeFileSync('docs/audit/email-safety.json', JSON.stringify(results, null, 2));

// Write Markdown output
const mdContent = `# Email Safety Report

Generated: ${results.timestamp}

## Email Providers (${results.providers.length})
${results.providers.map(provider => `
### ${provider.name}
- **File**: \`${provider.file}:${provider.line}\`
- **Status**: ${provider.detected ? '✅ Detected' : '❌ Not detected'}
`).join('\n')}

## Safety Features
- **Unsubscribe Handling**: ${results.safety.unsubscribe ? '✅ Implemented' : '❌ Missing'}
- **Footer/Signature**: ${results.safety.footer ? '✅ Implemented' : '❌ Missing'}
- **From/Reply-To**: ${results.safety.fromReplyTo ? '✅ Implemented' : '❌ Missing'}
- **Daily Caps**: ${results.safety.dailyCaps ? '✅ Implemented' : '❌ Missing'}
- **Domain Guards**: ${results.safety.domainGuards ? '✅ Implemented' : '❌ Missing'}
- **Suppression Handling**: ${results.safety.suppression ? '✅ Implemented' : '❌ Missing'}

## Configuration
${Object.keys(results.config).length > 0 ? 
  Object.entries(results.config).map(([key, value]) => `- **${key}**: \`${value}\``).join('\n') :
  'No email configuration found'
}

## Environment Variables
${Object.entries(results.envVars).map(([key, value]) => `- **${key}**: ${value === 'SET' ? '✅ Set' : '❌ Not set'}`).join('\n')}

## Summary
- **Providers Detected**: ${results.providers.length}
- **Safety Features Implemented**: ${Object.values(results.safety).filter(Boolean).length}/6
- **Configuration Items**: ${Object.keys(results.config).length}
- **Environment Variables Set**: ${Object.values(results.envVars).filter(v => v === 'SET').length}

## Recommendations
${!results.safety.unsubscribe ? '- ❌ **Implement unsubscribe handling** for compliance' : ''}
${!results.safety.footer ? '- ❌ **Add email footers** with company information' : ''}
${!results.safety.fromReplyTo ? '- ❌ **Configure from/reply-to addresses** properly' : ''}
${!results.safety.dailyCaps ? '- ⚠️ **Implement daily email caps** to prevent abuse' : ''}
${!results.safety.domainGuards ? '- ⚠️ **Add domain guards** for development environment' : ''}
${!results.safety.suppression ? '- ⚠️ **Implement suppression handling** for bounces/complaints' : ''}

${errors.length > 0 ? `
## Errors
${errors.map(error => `- ❌ ${error}`).join('\n')}
` : ''}
`;

writeFileSync('docs/audit/email-safety.md', mdContent);

console.log('✅ Email safety audit complete');
console.log(`📄 JSON: docs/audit/email-safety.json`);
console.log(`📄 Markdown: docs/audit/email-safety.md`);
