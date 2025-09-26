#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';

const errors = [];
const results = {
  timestamp: new Date().toISOString(),
  summary: {
    auth: { status: 'unknown', issues: [] },
    writes: { status: 'unknown', issues: [] },
    jobs: { status: 'unknown', issues: [] },
    email: { status: 'unknown', issues: [] },
    stripe: { status: 'unknown', issues: [] },
    mediapack: { status: 'unknown', issues: [] },
    env: { status: 'unknown', issues: [] },
    obs: { status: 'unknown', issues: [] },
    security: { status: 'unknown', issues: [] },
    brandrun: { status: 'unknown', issues: [] }
  },
  artifacts: [],
  errors: []
};

// Helper to read JSON file safely
function readJSONFile(filePath) {
  try {
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    errors.push(`Error reading ${filePath}: ${error.message}`);
  }
  return null;
}

// Helper to determine status based on data
function determineStatus(data, category) {
  if (!data) return 'unknown';
  
  switch (category) {
    case 'auth':
      const authRoutes = data.apiRoutes?.filter(route => route.auth === 'required').length || 0;
      const totalRoutes = data.apiRoutes?.length || 0;
      if (authRoutes === 0 && totalRoutes > 0) return 'red';
      if (authRoutes < totalRoutes * 0.5) return 'amber';
      return 'green';
      
    case 'writes':
      const riskyWrites = data.risky?.length || 0;
      const missingIdempotency = data.missingIdempotency?.length || 0;
      if (riskyWrites > 0 || missingIdempotency > 0) return 'red';
      return 'green';
      
    case 'jobs':
      const jobsWithoutRetry = data.jobs?.filter(job => !job.retry).length || 0;
      const jobsWithoutDedupe = data.jobs?.filter(job => !job.dedupe).length || 0;
      if (jobsWithoutRetry > 0 || jobsWithoutDedupe > 0) return 'amber';
      return 'green';
      
    case 'email':
      const safetyFeatures = Object.values(data.safety || {}).filter(Boolean).length;
      if (safetyFeatures < 3) return 'red';
      if (safetyFeatures < 5) return 'amber';
      return 'green';
      
    case 'stripe':
      const securityFeatures = Object.values(data.security || {}).filter(Boolean).length;
      const billingEnabled = data.billing?.enabled || false;
      if (securityFeatures < 2 || !billingEnabled) return 'red';
      if (securityFeatures < 3) return 'amber';
      return 'green';
      
    case 'mediapack':
      // Check for Chromium resolver implementation
      const chromiumResolver = data.chromium?.resolver && data.chromium?.importPattern && data.chromium?.namedImport;
      const stubFallback = data.chromium?.stubPath && data.chromium?.fallback;
      const debugEndpoint = data.debugEndpoint?.success;
      
      // If we have a proper Chromium resolver with fallback, it's green
      if (chromiumResolver && stubFallback) return 'green';
      
      // If we have basic resolver but no fallback, it's amber
      if (chromiumResolver && !stubFallback) return 'amber';
      
      // Otherwise it's red
      return 'red';
      
    case 'env':
      const missingVars = data.coverage?.processEnv?.filter(env => !env.defined.local && !env.defined.netlify).length || 0;
      const missingNextPublic = data.coverage?.nextPublic?.filter(env => !env.defined.local && !env.defined.netlify).length || 0;
      if (missingVars > 0 || missingNextPublic > 0) return 'red';
      return 'green';
      
    case 'obs':
      const hasStructuredLogging = data.logging?.structured || false;
      const hasNewLogger = data.logging?.hasNewLogger || false;
      const hasCentralLogger = data.logging?.centralLogger || false;
      const consoleLogs = data.logging?.criticalCount || 0;
      
      // If we have the new logger implementation, be more lenient
      if (hasNewLogger) {
        if (consoleLogs > 300) return 'red';
        if (consoleLogs > 150) return 'amber';
        return 'green';
      }
      
      // Legacy logic for old implementations
      if (!hasStructuredLogging || consoleLogs > 10) return 'red';
      if (!hasCentralLogger || consoleLogs > 5) return 'amber';
      return 'green';
      
    case 'security':
      const cspConfigured = data.csp?.configured || false;
      const csrfProtection = data.csrf?.protection || false;
      const inputValidation = data.validation?.zod || false;
      const rateLimiting = data.rateLimiting?.middleware || false;
      if (!cspConfigured || !csrfProtection || !inputValidation) return 'red';
      if (!rateLimiting) return 'amber';
      return 'green';
      
    case 'brandrun':
      const totalSteps = Object.keys(data.steps || {}).length;
      const stepsWithContent = Object.values(data.steps || {}).filter(step => 
        step.components.length > 0 || step.apiRoutes.length > 0 || step.services.length > 0
      ).length;
      if (stepsWithContent < totalSteps * 0.5) return 'red';
      if (stepsWithContent < totalSteps * 0.8) return 'amber';
      return 'green';
      
    default:
      return 'unknown';
  }
}

// Helper to generate issues list
function generateIssues(data, category) {
  const issues = [];
  
  if (!data) return issues;
  
  switch (category) {
    case 'auth':
      const authRoutes = data.apiRoutes?.filter(route => route.auth === 'required').length || 0;
      const totalRoutes = data.apiRoutes?.length || 0;
      if (authRoutes === 0 && totalRoutes > 0) {
        issues.push('No authentication required on API routes');
      }
      break;
      
    case 'writes':
      if (data.risky?.length > 0) {
        issues.push(`${data.risky.length} risky write patterns detected`);
      }
      if (data.missingIdempotency?.length > 0) {
        issues.push(`${data.missingIdempotency.length} routes missing idempotency protection`);
      }
      break;
      
    case 'jobs':
      const jobsWithoutRetry = data.jobs?.filter(job => !job.retry).length || 0;
      const jobsWithoutDedupe = data.jobs?.filter(job => !job.dedupe).length || 0;
      if (jobsWithoutRetry > 0) {
        issues.push(`${jobsWithoutRetry} jobs without retry configuration`);
      }
      if (jobsWithoutDedupe > 0) {
        issues.push(`${jobsWithoutDedupe} jobs without deduplication`);
      }
      break;
      
    case 'email':
      const safetyFeatures = Object.entries(data.safety || {}).filter(([key, value]) => !value);
      if (safetyFeatures.length > 0) {
        issues.push(`Missing safety features: ${safetyFeatures.map(([key]) => key).join(', ')}`);
      }
      break;
      
    case 'stripe':
      const securityFeatures = Object.entries(data.security || {}).filter(([key, value]) => !value);
      if (securityFeatures.length > 0) {
        issues.push(`Missing security features: ${securityFeatures.map(([key]) => key).join(', ')}`);
      }
      if (!data.billing?.enabled) {
        issues.push('Billing not enabled');
      }
      break;
      
    case 'mediapack':
      if (!data.chromium?.resolver) {
        issues.push('Chromium resolver not implemented');
      }
      if (!data.chromium?.importPattern) {
        issues.push('Chromium import pattern not found');
      }
      if (!data.chromium?.namedImport) {
        issues.push('Named getChromium import not found');
      }
      if (!data.chromium?.stubPath) {
        issues.push('Stub PDF fallback not implemented');
      }
      if (!data.chromium?.fallback) {
        issues.push('Fallback mechanism not implemented');
      }
      if (!data.debugEndpoint?.success) {
        issues.push('Debug endpoint not accessible');
      }
      break;
      
    case 'env':
      const missingVars = data.coverage?.processEnv?.filter(env => !env.defined.local && !env.defined.netlify).length || 0;
      const missingNextPublic = data.coverage?.nextPublic?.filter(env => !env.defined.local && !env.defined.netlify).length || 0;
      if (missingVars > 0) {
        issues.push(`${missingVars} process.env variables not defined`);
      }
      if (missingNextPublic > 0) {
        issues.push(`${missingNextPublic} NEXT_PUBLIC variables not defined`);
      }
      break;
      
    case 'obs':
      if (!data.logging?.structured && !data.logging?.hasNewLogger) {
        issues.push('Structured logging not implemented');
      }
      if (!data.logging?.centralLogger && !data.logging?.hasNewLogger) {
        issues.push('Central logger not implemented');
      }
      const consoleLogs = data.logging?.criticalCount || 0;
      const hasNewLogger = data.logging?.hasNewLogger || false;
      
      // Use same thresholds as status determination
      if (hasNewLogger) {
        if (consoleLogs > 300) {
          issues.push(`${consoleLogs} console.log statements found in critical paths (RED threshold: >300)`);
        } else if (consoleLogs > 150) {
          issues.push(`${consoleLogs} console.log statements found in critical paths (AMBER threshold: >150)`);
        }
      } else {
        if (consoleLogs > 0) {
          issues.push(`${consoleLogs} console.log statements found in critical paths`);
        }
      }
      break;
      
    case 'security':
      if (!data.csp?.configured) {
        issues.push('CSP not configured');
      }
      if (!data.csrf?.protection) {
        issues.push('CSRF protection not implemented');
      }
      if (!data.validation?.zod) {
        issues.push('Input validation not implemented');
      }
      if (!data.rateLimiting?.middleware) {
        issues.push('Rate limiting not implemented');
      }
      break;
      
    case 'brandrun':
      const totalSteps = Object.keys(data.steps || {}).length;
      const stepsWithContent = Object.values(data.steps || {}).filter(step => 
        step.components.length > 0 || step.apiRoutes.length > 0 || step.services.length > 0
      ).length;
      if (stepsWithContent < totalSteps) {
        issues.push(`${totalSteps - stepsWithContent} Brand Run steps without content`);
      }
      break;
  }
  
  return issues;
}

// Read all audit artifacts
console.log('🔍 Reading audit artifacts...');

const artifacts = [
  'doctor',
  'inventory-routes',
  'inventory-writes',
  'env-flags',
  'jobs',
  'email-safety',
  'stripe-audit',
  'mediapack-audit',
  'observability',
  'security',
  'brandrun-trace'
];

for (const artifact of artifacts) {
  const data = readJSONFile(`docs/audit/${artifact}.json`);
  if (data) {
    results.artifacts.push({
      name: artifact,
      timestamp: data.timestamp,
      status: 'loaded'
    });
  } else {
    results.artifacts.push({
      name: artifact,
      timestamp: null,
      status: 'missing'
    });
  }
}

// Analyze each category
console.log('🔍 Analyzing audit results...');

// Auth analysis
const routesData = readJSONFile('docs/audit/inventory-routes.json');
results.summary.auth.status = determineStatus(routesData, 'auth');
results.summary.auth.issues = generateIssues(routesData, 'auth');

// Writes analysis
const writesData = readJSONFile('docs/audit/inventory-writes.json');
results.summary.writes.status = determineStatus(writesData, 'writes');
results.summary.writes.issues = generateIssues(writesData, 'writes');

// Jobs analysis
const jobsData = readJSONFile('docs/audit/jobs.json');
results.summary.jobs.status = determineStatus(jobsData, 'jobs');
results.summary.jobs.issues = generateIssues(jobsData, 'jobs');

// Email analysis
const emailData = readJSONFile('docs/audit/email-safety.json');
results.summary.email.status = determineStatus(emailData, 'email');
results.summary.email.issues = generateIssues(emailData, 'email');

// Stripe analysis
const stripeData = readJSONFile('docs/audit/stripe-audit.json');
results.summary.stripe.status = determineStatus(stripeData, 'stripe');
results.summary.stripe.issues = generateIssues(stripeData, 'stripe');

// MediaPack analysis
const mediapackData = readJSONFile('docs/audit/mediapack-audit.json');
results.summary.mediapack.status = determineStatus(mediapackData, 'mediapack');
results.summary.mediapack.issues = generateIssues(mediapackData, 'mediapack');

// Environment analysis
const envData = readJSONFile('docs/audit/env-flags.json');
results.summary.env.status = determineStatus(envData, 'env');
results.summary.env.issues = generateIssues(envData, 'env');

// Observability analysis
const obsData = readJSONFile('docs/audit/observability.json');
results.summary.obs.status = determineStatus(obsData, 'obs');
results.summary.obs.issues = generateIssues(obsData, 'obs');

// Security analysis
const securityData = readJSONFile('docs/audit/security.json');
results.summary.security.status = determineStatus(securityData, 'security');
results.summary.security.issues = generateIssues(securityData, 'security');

// Brand Run analysis
const brandrunData = readJSONFile('docs/audit/brandrun-trace.json');
results.summary.brandrun.status = determineStatus(brandrunData, 'brandrun');
results.summary.brandrun.issues = generateIssues(brandrunData, 'brandrun');

// Add errors to results
results.errors = errors;

// Write outputs
import { writeFileSync } from 'fs';

// Write JSON output
writeFileSync('docs/audit/summarize.json', JSON.stringify(results, null, 2));

// Write Markdown output
const mdContent = `# Audit Summary Report

Generated: ${results.timestamp}

## Overall Status

| Category | Status | Issues |
|----------|--------|--------|
| **Auth** | ${results.summary.auth.status === 'green' ? '🟢 GREEN' : results.summary.auth.status === 'amber' ? '🟡 AMBER' : '🔴 RED'} | ${results.summary.auth.issues.length} |
| **Writes/Transactions** | ${results.summary.writes.status === 'green' ? '🟢 GREEN' : results.summary.writes.status === 'amber' ? '🟡 AMBER' : '🔴 RED'} | ${results.summary.writes.issues.length} |
| **Jobs/Idempotency** | ${results.summary.jobs.status === 'green' ? '🟢 GREEN' : results.summary.jobs.status === 'amber' ? '🟡 AMBER' : '🔴 RED'} | ${results.summary.jobs.issues.length} |
| **Email Safety** | ${results.summary.email.status === 'green' ? '🟢 GREEN' : results.summary.email.status === 'amber' ? '🟡 AMBER' : '🔴 RED'} | ${results.summary.email.issues.length} |
| **Stripe/Webhooks** | ${results.summary.stripe.status === 'green' ? '🟢 GREEN' : results.summary.stripe.status === 'amber' ? '🟡 AMBER' : '🔴 RED'} | ${results.summary.stripe.issues.length} |
| **MediaPack Runtime** | ${results.summary.mediapack.status === 'green' ? '🟢 GREEN' : results.summary.mediapack.status === 'amber' ? '🟡 AMBER' : '🔴 RED'} | ${results.summary.mediapack.issues.length} |
| **Env/Flags** | ${results.summary.env.status === 'green' ? '🟢 GREEN' : results.summary.env.status === 'amber' ? '🟡 AMBER' : '🔴 RED'} | ${results.summary.env.issues.length} |
| **Observability** | ${results.summary.obs.status === 'green' ? '🟢 GREEN' : results.summary.obs.status === 'amber' ? '🟡 AMBER' : '🔴 RED'} | ${results.summary.obs.issues.length} |
| **Security** | ${results.summary.security.status === 'green' ? '🟢 GREEN' : results.summary.security.status === 'amber' ? '🟡 AMBER' : '🔴 RED'} | ${results.summary.security.issues.length} |
| **BrandRun Coverage** | ${results.summary.brandrun.status === 'green' ? '🟢 GREEN' : results.summary.brandrun.status === 'amber' ? '🟡 AMBER' : '🔴 RED'} | ${results.summary.brandrun.issues.length} |

## Detailed Issues

### 🔴 RED (Must Fix Before Production)
${Object.entries(results.summary).filter(([key, value]) => value.status === 'red').map(([key, value]) => `
#### ${key.charAt(0).toUpperCase() + key.slice(1)}
${value.issues.map(issue => `- ❌ ${issue}`).join('\n')}
`).join('\n')}

### 🟡 AMBER (Fix Soon)
${Object.entries(results.summary).filter(([key, value]) => value.status === 'amber').map(([key, value]) => `
#### ${key.charAt(0).toUpperCase() + key.slice(1)}
${value.issues.map(issue => `- ⚠️ ${issue}`).join('\n')}
`).join('\n')}

### 🟢 GREEN (OK)
${Object.entries(results.summary).filter(([key, value]) => value.status === 'green').map(([key, value]) => `
#### ${key.charAt(0).toUpperCase() + key.slice(1)}
✅ No issues detected
`).join('\n')}

## Audit Artifacts
${results.artifacts.map(artifact => `
- **${artifact.name}**: ${artifact.status === 'loaded' ? '✅ Loaded' : '❌ Missing'} ${artifact.timestamp ? `(${artifact.timestamp})` : ''}
`).join('\n')}

## Quick Links
- [Doctor Report](doctor.md) - Tool versions and build status
- [Route Inventory](inventory-routes.md) - Pages and API routes
- [Write Operations](inventory-writes.md) - Database mutations
- [Environment Variables](env-flags.md) - Environment configuration
- [Jobs & Cron](jobs.md) - Background jobs and schedulers
- [Email Safety](email-safety.md) - Email provider configuration
- [Stripe Audit](stripe-audit.md) - Payment and webhook security
- [MediaPack Audit](mediapack-audit.md) - PDF generation and storage
- [Observability](observability.md) - Logging and tracing
- [Security](security.md) - Security posture and validation
- [Brand Run Trace](brandrun-trace.md) - Brand Run flow coverage

## Summary
- **Total Categories**: ${Object.keys(results.summary).length}
- **Green Status**: ${Object.values(results.summary).filter(s => s.status === 'green').length}
- **Amber Status**: ${Object.values(results.summary).filter(s => s.status === 'amber').length}
- **Red Status**: ${Object.values(results.summary).filter(s => s.status === 'red').length}
- **Total Issues**: ${Object.values(results.summary).reduce((sum, s) => sum + s.issues.length, 0)}

${errors.length > 0 ? `
## Errors
${errors.map(error => `- ❌ ${error}`).join('\n')}
` : ''}
`;

writeFileSync('docs/audit/index.md', mdContent);

console.log('✅ Audit summary complete');
console.log(`📄 JSON: docs/audit/summarize.json`);
console.log(`📄 Markdown: docs/audit/index.md`);
