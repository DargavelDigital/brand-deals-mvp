#!/usr/bin/env node

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, relative } from 'path';

const errors = [];
const results = {
  timestamp: new Date().toISOString(),
  csp: {
    configured: false,
    violations: []
  },
  csrf: {
    protection: false,
    sameSite: false,
    secure: false
  },
  validation: {
    zod: false,
    validators: [],
    missing: []
  },
  webhooks: {
    signatureChecks: [],
    tokenChecks: []
  },
  rateLimiting: {
    middleware: false,
    implementations: []
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

// Helper to check CSP configuration
function checkCSP(content, filePath) {
  const csp = {
    configured: false,
    violations: []
  };
  
  // Check for CSP configuration
  const cspPatterns = [
    /content.*security.*policy/i,
    /csp/i,
    /Content-Security-Policy/i
  ];
  
  csp.configured = cspPatterns.some(pattern => pattern.test(content));
  
  // Look for potential CSP violations
  const violationPatterns = [
    /eval\s*\(/,
    /new\s+Function\s*\(/,
    /setTimeout\s*\([^,]*['"`]/,
    /setInterval\s*\([^,]*['"`]/,
    /innerHTML\s*=/,
    /outerHTML\s*=/
  ];
  
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pattern of violationPatterns) {
      if (pattern.test(line)) {
        csp.violations.push({
          file: relative('src', filePath),
          line: i + 1,
          content: line.trim(),
          pattern: pattern.source
        });
      }
    }
  }
  
  return csp;
}

// Helper to check CSRF protection
function checkCSRF(content, filePath) {
  const csrf = {
    protection: false,
    sameSite: false,
    secure: false
  };
  
  // Check for CSRF protection
  const csrfPatterns = [
    /csrf/i,
    /csrf.*protection/i,
    /csrf.*token/i,
    /sameSite/i,
    /secure.*cookie/i
  ];
  
  csrf.protection = csrfPatterns.some(pattern => pattern.test(content));
  
  // Check for sameSite configuration
  const sameSitePatterns = [
    /sameSite\s*[=:]\s*['"`](strict|lax|none)['"`]/i,
    /sameSite.*strict/i,
    /sameSite.*lax/i
  ];
  
  csrf.sameSite = sameSitePatterns.some(pattern => pattern.test(content));
  
  // Check for secure cookie configuration
  const securePatterns = [
    /secure.*true/i,
    /secure\s*[=:]\s*true/i,
    /cookie.*secure/i
  ];
  
  csrf.secure = securePatterns.some(pattern => pattern.test(content));
  
  return csrf;
}

// Helper to check input validation
function checkInputValidation(content, filePath) {
  const validation = {
    zod: false,
    validators: [],
    missing: []
  };
  
  // Check for Zod usage
  const zodPatterns = [
    /import.*zod/i,
    /from.*zod/i,
    /z\./,
    /zod\./
  ];
  
  validation.zod = zodPatterns.some(pattern => pattern.test(content));
  
  // Look for validation patterns
  const validationPatterns = [
    { name: 'Zod Schema', pattern: /z\.(string|number|boolean|object|array)/i },
    { name: 'Validation Function', pattern: /validate|validation/i },
    { name: 'Schema Parse', pattern: /\.parse\s*\(/i },
    { name: 'Schema Safe Parse', pattern: /\.safeParse\s*\(/i }
  ];
  
  for (const validator of validationPatterns) {
    if (validator.pattern.test(content)) {
      validation.validators.push({
        name: validator.name,
        file: relative('src', filePath),
        line: content.search(validator.pattern) + 1
      });
    }
  }
  
  return validation;
}

// Helper to check webhook security
function checkWebhookSecurity(content, filePath) {
  const webhooks = {
    signatureChecks: [],
    tokenChecks: []
  };
  
  // Look for signature verification
  const signaturePatterns = [
    { name: 'Stripe Signature', pattern: /stripe.*signature/i },
    { name: 'Webhook Signature', pattern: /webhook.*signature/i },
    { name: 'HMAC Signature', pattern: /hmac.*signature/i },
    { name: 'Signature Verification', pattern: /verify.*signature/i }
  ];
  
  for (const signature of signaturePatterns) {
    if (signature.pattern.test(content)) {
      webhooks.signatureChecks.push({
        name: signature.name,
        file: relative('src', filePath),
        line: content.search(signature.pattern) + 1
      });
    }
  }
  
  // Look for token checks
  const tokenPatterns = [
    { name: 'Cron Token', pattern: /cron.*token/i },
    { name: 'API Token', pattern: /api.*token/i },
    { name: 'Auth Token', pattern: /auth.*token/i },
    { name: 'Bearer Token', pattern: /bearer.*token/i }
  ];
  
  for (const token of tokenPatterns) {
    if (token.pattern.test(content)) {
      webhooks.tokenChecks.push({
        name: token.name,
        file: relative('src', filePath),
        line: content.search(token.pattern) + 1
      });
    }
  }
  
  return webhooks;
}

// Helper to check rate limiting
function checkRateLimiting(content, filePath) {
  const rateLimiting = {
    middleware: false,
    implementations: []
  };
  
  // Check for rate limiting middleware
  const middlewarePatterns = [
    /rate.*limit/i,
    /rateLimit/i,
    /throttle/i,
    /limiter/i
  ];
  
  rateLimiting.middleware = middlewarePatterns.some(pattern => pattern.test(content));
  
  // Look for specific implementations
  const implementationPatterns = [
    { name: 'Express Rate Limit', pattern: /express.*rate.*limit/i },
    { name: 'Next.js Rate Limit', pattern: /next.*rate.*limit/i },
    { name: 'Custom Rate Limit', pattern: /custom.*rate.*limit/i },
    { name: 'Redis Rate Limit', pattern: /redis.*rate.*limit/i }
  ];
  
  for (const impl of implementationPatterns) {
    if (impl.pattern.test(content)) {
      rateLimiting.implementations.push({
        name: impl.name,
        file: relative('src', filePath),
        line: content.search(impl.pattern) + 1
      });
    }
  }
  
  return rateLimiting;
}

// Scan for security-related files
console.log('🔍 Scanning for security-related files...');
const securityFiles = findFiles('src', /\.(ts|tsx)$/);

for (const filePath of securityFiles) {
  try {
    const content = readFileSync(filePath, 'utf8');
    
    // Check if file contains security-related code
    if (content.match(/security|auth|validation|csrf|csp|rate.*limit/i)) {
      const csp = checkCSP(content, filePath);
      const csrf = checkCSRF(content, filePath);
      const validation = checkInputValidation(content, filePath);
      const webhooks = checkWebhookSecurity(content, filePath);
      const rateLimiting = checkRateLimiting(content, filePath);
      
      // Update overall CSP status
      if (csp.configured) {
        results.csp.configured = true;
      }
      results.csp.violations.push(...csp.violations);
      
      // Update overall CSRF status
      if (csrf.protection) {
        results.csrf.protection = true;
      }
      if (csrf.sameSite) {
        results.csrf.sameSite = true;
      }
      if (csrf.secure) {
        results.csrf.secure = true;
      }
      
      // Update overall validation status
      if (validation.zod) {
        results.validation.zod = true;
      }
      results.validation.validators.push(...validation.validators);
      
      // Update webhook security
      results.webhooks.signatureChecks.push(...webhooks.signatureChecks);
      results.webhooks.tokenChecks.push(...webhooks.tokenChecks);
      
      // Update rate limiting
      if (rateLimiting.middleware) {
        results.rateLimiting.middleware = true;
      }
      results.rateLimiting.implementations.push(...rateLimiting.implementations);
    }
  } catch (error) {
    errors.push(`Error reading ${filePath}: ${error.message}`);
  }
}

// Check for specific security files
console.log('🔍 Checking for security configuration files...');
const securityConfigFiles = [
  'src/middleware.ts',
  'src/middleware/',
  'src/lib/auth',
  'src/lib/security'
];

for (const configPath of securityConfigFiles) {
  if (existsSync(configPath)) {
    const files = findFiles(configPath, /\.(ts|tsx)$/);
    for (const filePath of files) {
      try {
        const content = readFileSync(filePath, 'utf8');
        const csp = checkCSP(content, filePath);
        const csrf = checkCSRF(content, filePath);
        const validation = checkInputValidation(content, filePath);
        const webhooks = checkWebhookSecurity(content, filePath);
        const rateLimiting = checkRateLimiting(content, filePath);
        
        // Update overall status
        if (csp.configured) {
          results.csp.configured = true;
        }
        results.csp.violations.push(...csp.violations);
        
        if (csrf.protection) {
          results.csrf.protection = true;
        }
        if (csrf.sameSite) {
          results.csrf.sameSite = true;
        }
        if (csrf.secure) {
          results.csrf.secure = true;
        }
        
        if (validation.zod) {
          results.validation.zod = true;
        }
        results.validation.validators.push(...validation.validators);
        
        results.webhooks.signatureChecks.push(...webhooks.signatureChecks);
        results.webhooks.tokenChecks.push(...webhooks.tokenChecks);
        
        if (rateLimiting.middleware) {
          results.rateLimiting.middleware = true;
        }
        results.rateLimiting.implementations.push(...rateLimiting.implementations);
      } catch (error) {
        errors.push(`Error reading ${filePath}: ${error.message}`);
      }
    }
  }
}

// Check for missing validation on write routes
console.log('🔍 Checking for missing validation on write routes...');
const writeRoutes = findFiles('src/app/api', /route\.(ts|tsx)$/);

for (const filePath of writeRoutes) {
  try {
    const content = readFileSync(filePath, 'utf8');
    
    // Check if route has write operations
    if (content.match(/prisma\.\w+\.(create|update|delete|upsert)/)) {
      const validation = checkInputValidation(content, filePath);
      
      if (!validation.zod && validation.validators.length === 0) {
        results.validation.missing.push({
          file: relative('src', filePath),
          reason: 'Write route without input validation'
        });
      }
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
writeFileSync('docs/audit/security.json', JSON.stringify(results, null, 2));

// Write Markdown output
const mdContent = `# Security Report

Generated: ${results.timestamp}

## Content Security Policy (CSP)
- **Configured**: ${results.csp.configured ? '✅ Yes' : '❌ No'}
- **Violations**: ${results.csp.violations.length}

### Potential CSP Violations
${results.csp.violations.map(violation => `
- **File**: \`${violation.file}:${violation.line}\`
- **Pattern**: \`${violation.pattern}\`
- **Content**: \`${violation.content}\`
`).join('\n')}

## CSRF Protection
- **Protection**: ${results.csrf.protection ? '✅ Implemented' : '❌ Not implemented'}
- **SameSite**: ${results.csrf.sameSite ? '✅ Configured' : '❌ Not configured'}
- **Secure Cookies**: ${results.csrf.secure ? '✅ Configured' : '❌ Not configured'}

## Input Validation
- **Zod Usage**: ${results.validation.zod ? '✅ Implemented' : '❌ Not implemented'}
- **Validators Found**: ${results.validation.validators.length}

### Validation Implementations
${results.validation.validators.map(validator => `
- **${validator.name}**: \`${validator.file}:${validator.line}\`
`).join('\n')}

### Missing Validation
${results.validation.missing.map(missing => `
- **File**: \`${missing.file}\`
- **Reason**: ${missing.reason}
`).join('\n')}

## Webhook Security
### Signature Checks (${results.webhooks.signatureChecks.length})
${results.webhooks.signatureChecks.map(check => `
- **${check.name}**: \`${check.file}:${check.line}\`
`).join('\n')}

### Token Checks (${results.webhooks.tokenChecks.length})
${results.webhooks.tokenChecks.map(check => `
- **${check.name}**: \`${check.file}:${check.line}\`
`).join('\n')}

## Rate Limiting
- **Middleware**: ${results.rateLimiting.middleware ? '✅ Implemented' : '❌ Not implemented'}
- **Implementations**: ${results.rateLimiting.implementations.length}

### Rate Limiting Implementations
${results.rateLimiting.implementations.map(impl => `
- **${impl.name}**: \`${impl.file}:${impl.line}\`
`).join('\n')}

## Summary
- **CSP Configured**: ${results.csp.configured ? 'Yes' : 'No'}
- **CSP Violations**: ${results.csp.violations.length}
- **CSRF Protection**: ${results.csrf.protection ? 'Yes' : 'No'}
- **Input Validation**: ${results.validation.zod ? 'Yes' : 'No'}
- **Missing Validation**: ${results.validation.missing.length}
- **Webhook Security**: ${results.webhooks.signatureChecks.length + results.webhooks.tokenChecks.length}
- **Rate Limiting**: ${results.rateLimiting.middleware ? 'Yes' : 'No'}

## Recommendations
${!results.csp.configured ? '- ❌ **Implement CSP** for XSS protection' : ''}
${results.csp.violations.length > 0 ? `- ⚠️ **Fix ${results.csp.violations.length} CSP violations**` : ''}
${!results.csrf.protection ? '- ❌ **Implement CSRF protection** for form submissions' : ''}
${!results.csrf.sameSite ? '- ⚠️ **Configure SameSite cookies** for CSRF protection' : ''}
${!results.csrf.secure ? '- ⚠️ **Enable secure cookies** for HTTPS' : ''}
${!results.validation.zod ? '- ❌ **Implement Zod validation** for input sanitization' : ''}
${results.validation.missing.length > 0 ? `- ❌ **Add validation to ${results.validation.missing.length} write routes**` : ''}
${results.webhooks.signatureChecks.length === 0 ? '- ❌ **Implement webhook signature verification**' : ''}
${results.webhooks.tokenChecks.length === 0 ? '- ⚠️ **Add token checks** for cron/webhook endpoints' : ''}
${!results.rateLimiting.middleware ? '- ⚠️ **Implement rate limiting** to prevent abuse' : ''}

${errors.length > 0 ? `
## Errors
${errors.map(error => `- ❌ ${error}`).join('\n')}
` : ''}
`;

writeFileSync('docs/audit/security.md', mdContent);

console.log('✅ Security audit complete');
console.log(`📄 JSON: docs/audit/security.json`);
console.log(`📄 Markdown: docs/audit/security.md`);
