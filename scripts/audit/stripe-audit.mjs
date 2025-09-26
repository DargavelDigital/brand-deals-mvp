#!/usr/bin/env node

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, relative } from 'path';

const errors = [];
const results = {
  timestamp: new Date().toISOString(),
  webhooks: [],
  billing: {
    enabled: false,
    secretKey: false,
    planGates: []
  },
  security: {
    signatureVerification: false,
    duplicateEventProtection: false,
    errorHandling: false
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

// Helper to extract webhook information
function extractWebhookInfo(content, filePath) {
  const webhooks = [];
  const lines = content.split('\n');
  
  // Look for webhook handler patterns
  const webhookPatterns = [
    { name: 'Stripe Webhook', pattern: /stripe.*webhook/i },
    { name: 'Billing Webhook', pattern: /billing.*webhook/i }
  ];
  
  for (const webhook of webhookPatterns) {
    if (webhook.pattern.test(content)) {
      const lineNum = content.search(webhook.pattern);
      const line = content.substring(0, lineNum).split('\n').length;
      
      const webhookInfo = {
        name: webhook.name,
        file: relative('src', filePath),
        line: line,
        signatureVerification: false,
        duplicateEventProtection: false,
        errorHandling: false,
        events: []
      };
      
      // Check for signature verification
      const signaturePatterns = [
        /stripe.*signature/i,
        /webhook.*signature/i,
        /verify.*signature/i,
        /constructEvent/i
      ];
      
      webhookInfo.signatureVerification = signaturePatterns.some(pattern => pattern.test(content));
      
      // Check for duplicate event protection
      const duplicatePatterns = [
        /duplicate.*event/i,
        /event.*id/i,
        /idempotency/i,
        /event.*exists/i
      ];
      
      webhookInfo.duplicateEventProtection = duplicatePatterns.some(pattern => pattern.test(content));
      
      // Check for error handling
      const errorPatterns = [
        /try.*catch/i,
        /error.*handling/i,
        /webhook.*error/i,
        /stripe.*error/i
      ];
      
      webhookInfo.errorHandling = errorPatterns.some(pattern => pattern.test(content));
      
      // Extract event types
      const eventMatches = content.match(/event\.type\s*[=:]\s*['"`]([^'"`]+)['"`]/g);
      if (eventMatches) {
        webhookInfo.events = eventMatches.map(match => 
          match.match(/['"`]([^'"`]+)['"`]/)[1]
        );
      }
      
      webhooks.push(webhookInfo);
    }
  }
  
  return webhooks;
}

// Helper to check billing configuration
function checkBillingConfig(content, filePath) {
  const billing = {
    enabled: false,
    secretKey: false,
    planGates: []
  };
  
  // Check for billing feature flag
  const billingPatterns = [
    /FEATURE_BILLING_ENABLED/i,
    /billing.*enabled/i,
    /billing.*flag/i
  ];
  
  billing.enabled = billingPatterns.some(pattern => pattern.test(content));
  
  // Check for Stripe secret key
  const secretKeyPatterns = [
    /STRIPE_SECRET_KEY/i,
    /stripe.*secret/i,
    /secret.*key/i
  ];
  
  billing.secretKey = secretKeyPatterns.some(pattern => pattern.test(content));
  
  // Look for plan gates
  const planGatePatterns = [
    /plan.*gate/i,
    /entitlement/i,
    /subscription.*check/i,
    /billing.*check/i
  ];
  
  for (const pattern of planGatePatterns) {
    if (pattern.test(content)) {
      billing.planGates.push({
        pattern: pattern.source,
        file: relative('src', filePath),
        line: content.search(pattern) + 1
      });
    }
  }
  
  return billing;
}

// Helper to check Stripe security patterns
function checkStripeSecurity(content, filePath) {
  const security = {
    signatureVerification: false,
    duplicateEventProtection: false,
    errorHandling: false
  };
  
  // Check for signature verification
  const signaturePatterns = [
    /stripe.*signature/i,
    /webhook.*signature/i,
    /verify.*signature/i,
    /constructEvent/i
  ];
  
  security.signatureVerification = signaturePatterns.some(pattern => pattern.test(content));
  
  // Check for duplicate event protection
  const duplicatePatterns = [
    /duplicate.*event/i,
    /event.*id/i,
    /idempotency/i,
    /event.*exists/i
  ];
  
  security.duplicateEventProtection = duplicatePatterns.some(pattern => pattern.test(content));
  
  // Check for error handling
  const errorPatterns = [
    /try.*catch/i,
    /error.*handling/i,
    /webhook.*error/i,
    /stripe.*error/i
  ];
  
  security.errorHandling = errorPatterns.some(pattern => pattern.test(content));
  
  return security;
}

// Scan for Stripe-related files
console.log('🔍 Scanning for Stripe-related files...');
const stripeFiles = findFiles('src', /\.(ts|tsx)$/);

for (const filePath of stripeFiles) {
  try {
    const content = readFileSync(filePath, 'utf8');
    
    // Check if file contains Stripe-related code
    if (content.match(/stripe|billing|webhook/i)) {
      const webhooks = extractWebhookInfo(content, filePath);
      const billing = checkBillingConfig(content, filePath);
      const security = checkStripeSecurity(content, filePath);
      
      results.webhooks.push(...webhooks);
      
      // Update overall billing status
      if (billing.enabled) {
        results.billing.enabled = true;
      }
      if (billing.secretKey) {
        results.billing.secretKey = true;
      }
      results.billing.planGates.push(...billing.planGates);
      
      // Update overall security status
      if (security.signatureVerification) {
        results.security.signatureVerification = true;
      }
      if (security.duplicateEventProtection) {
        results.security.duplicateEventProtection = true;
      }
      if (security.errorHandling) {
        results.security.errorHandling = true;
      }
    }
  } catch (error) {
    errors.push(`Error reading ${filePath}: ${error.message}`);
  }
}

// Check for specific Stripe webhook files
console.log('🔍 Checking for Stripe webhook files...');
const webhookFiles = [
  'src/app/api/stripe/webhook',
  'src/app/api/billing/webhook'
];

for (const webhookDir of webhookFiles) {
  if (existsSync(webhookDir)) {
    const files = findFiles(webhookDir, /\.(ts|tsx)$/);
    for (const filePath of files) {
      try {
        const content = readFileSync(filePath, 'utf8');
        const webhooks = extractWebhookInfo(content, filePath);
        const security = checkStripeSecurity(content, filePath);
        
        results.webhooks.push(...webhooks);
        
        // Update overall security status
        if (security.signatureVerification) {
          results.security.signatureVerification = true;
        }
        if (security.duplicateEventProtection) {
          results.security.duplicateEventProtection = true;
        }
        if (security.errorHandling) {
          results.security.errorHandling = true;
        }
      } catch (error) {
        errors.push(`Error reading ${filePath}: ${error.message}`);
      }
    }
  }
}

// Check for environment variables
console.log('🔍 Checking Stripe environment variables...');
const stripeEnvVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_WEBHOOK_ENDPOINT_SECRET'
];

results.envVars = {};
for (const envVar of stripeEnvVars) {
  results.envVars[envVar] = process.env[envVar] ? 'SET' : 'NOT_SET';
}

// Add errors to results
results.errors = errors;

// Write outputs
import { writeFileSync } from 'fs';

// Write JSON output
writeFileSync('docs/audit/stripe-audit.json', JSON.stringify(results, null, 2));

// Write Markdown output
const mdContent = `# Stripe Audit Report

Generated: ${results.timestamp}

## Webhooks (${results.webhooks.length})
${results.webhooks.map(webhook => `
### ${webhook.name}
- **File**: \`${webhook.file}:${webhook.line}\`
- **Signature Verification**: ${webhook.signatureVerification ? '✅ Implemented' : '❌ Missing'}
- **Duplicate Event Protection**: ${webhook.duplicateEventProtection ? '✅ Implemented' : '❌ Missing'}
- **Error Handling**: ${webhook.errorHandling ? '✅ Implemented' : '❌ Missing'}
- **Events**: ${webhook.events.length > 0 ? webhook.events.join(', ') : 'None detected'}
`).join('\n')}

## Billing Configuration
- **Billing Enabled**: ${results.billing.enabled ? '✅ Enabled' : '❌ Not enabled'}
- **Secret Key**: ${results.billing.secretKey ? '✅ Configured' : '❌ Not configured'}
- **Plan Gates**: ${results.billing.planGates.length > 0 ? '✅ Found' : '❌ Not found'}

### Plan Gates (${results.billing.planGates.length})
${results.billing.planGates.map(gate => `
- **Pattern**: \`${gate.pattern}\`
- **File**: \`${gate.file}:${gate.line}\`
`).join('\n')}

## Security Features
- **Signature Verification**: ${results.security.signatureVerification ? '✅ Implemented' : '❌ Missing'}
- **Duplicate Event Protection**: ${results.security.duplicateEventProtection ? '✅ Implemented' : '❌ Missing'}
- **Error Handling**: ${results.security.errorHandling ? '✅ Implemented' : '❌ Missing'}

## Environment Variables
${Object.entries(results.envVars).map(([key, value]) => `- **${key}**: ${value === 'SET' ? '✅ Set' : '❌ Not set'}`).join('\n')}

## Summary
- **Webhooks Found**: ${results.webhooks.length}
- **Billing Enabled**: ${results.billing.enabled ? 'Yes' : 'No'}
- **Security Features**: ${Object.values(results.security).filter(Boolean).length}/3
- **Environment Variables Set**: ${Object.values(results.envVars).filter(v => v === 'SET').length}

## Recommendations
${!results.security.signatureVerification ? '- ❌ **Implement webhook signature verification** for security' : ''}
${!results.security.duplicateEventProtection ? '- ❌ **Implement duplicate event protection** to prevent replay attacks' : ''}
${!results.security.errorHandling ? '- ❌ **Implement proper error handling** for webhooks' : ''}
${!results.billing.enabled ? '- ⚠️ **Enable billing feature flag** if billing is required' : ''}
${!results.billing.secretKey ? '- ⚠️ **Configure Stripe secret key** for API access' : ''}
${results.billing.planGates.length === 0 ? '- ⚠️ **Implement plan gates** for entitlement enforcement' : ''}

${errors.length > 0 ? `
## Errors
${errors.map(error => `- ❌ ${error}`).join('\n')}
` : ''}
`;

writeFileSync('docs/audit/stripe-audit.md', mdContent);

console.log('✅ Stripe audit complete');
console.log(`📄 JSON: docs/audit/stripe-audit.json`);
console.log(`📄 Markdown: docs/audit/stripe-audit.md`);
