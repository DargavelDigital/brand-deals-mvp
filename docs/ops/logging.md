# Logging Standards

## Overview

This document outlines the logging standards and practices for the Brand Deals MVP application.

## Approved Logging Path

**Use `@/lib/log` for all logging in critical paths.**

```typescript
import { log } from '@/lib/log';

// ✅ Correct usage
log.info('Operation started', { feature: 'user-auth', userId: '123' });
log.warn('Rate limit approaching', { feature: 'api', remaining: 5 });
log.error('Database connection failed', { feature: 'db', error: error.message });
```

## Critical Paths

The following paths are considered critical and **MUST** use structured logging:

- `src/app/api/**` - API routes
- `src/services/**` - Service layer
- `src/lib/jobs/**` - Background jobs
- `src/services/brandRun/**` - Brand run orchestration

## ESLint Rules

### Console.log Restrictions

In critical paths, `console.log`, `console.warn`, and `console.error` are **forbidden** except:

- `console.error` in catch blocks followed by `throw` or error return
- Temporary debugging (must be removed before commit)

### ESLint Configuration

```javascript
{
  "files": [
    "src/app/api/**/*.{ts,tsx}",
    "src/services/**/*.{ts,tsx}",
    "src/lib/jobs/**/*.{ts,tsx}",
    "src/services/brandRun/**/*.{ts,tsx}"
  ],
  "rules": {
    "no-console": "error",
    "custom/no-console-critical": "error",
    "no-restricted-properties": [
      "error",
      {
        "object": "console",
        "property": "log",
        "message": "Use log.info/warn/error instead of console.log in critical paths"
      }
    ]
  }
}
```

## Structured Logging Format

All logs follow this JSON structure:

```json
{
  "ts": "2025-09-26T10:35:47.208Z",
  "level": "info|warn|error",
  "msg": "Human-readable message",
  "requestId": "uuid-v4",
  "workspaceId": "workspace-id-or-unknown",
  "feature": "feature-name",
  "meta": {
    "additional": "context"
  }
}
```

## Log Levels

- **`info`**: Normal operations, successful completions
- **`warn`**: Recoverable issues, fallbacks, rate limits
- **`error`**: Failures, exceptions, critical issues

## Feature Names

Use consistent feature names for filtering:

- `user-auth` - Authentication and authorization
- `api` - General API operations
- `db` - Database operations
- `email` - Email sending and processing
- `mediapack` - Media pack generation
- `audit` - Audit operations
- `brandrun` - Brand run orchestration
- `outreach` - Outreach campaigns
- `match` - AI matching
- `stripe` - Payment processing

## Examples

### ✅ Good Examples

```typescript
// API route
log.info('User login attempt', { 
  feature: 'user-auth', 
  email: user.email,
  provider: 'google'
});

// Service layer
log.warn('Rate limit exceeded', { 
  feature: 'api', 
  userId: user.id,
  limit: 100,
  current: 101
});

// Error handling
log.error('Database query failed', { 
  feature: 'db', 
  query: 'getUser',
  error: error.message,
  userId: user.id
});
```

### ❌ Bad Examples

```typescript
// ❌ Don't use console.log in critical paths
console.log('User logged in');

// ❌ Don't use console.warn
console.warn('Rate limit exceeded');

// ❌ Don't use console.error (except in catch blocks)
console.error('Database failed');
```

### ✅ Exception: Console.error in Catch Blocks

```typescript
try {
  await riskyOperation();
} catch (error) {
  console.error('Operation failed:', error); // ✅ Allowed
  throw error; // Must be followed by throw or error return
}
```

## Migration Guide

### Step 1: Replace console.log
```typescript
// Before
console.log('Processing request', { userId: user.id });

// After
log.info('Processing request', { 
  feature: 'api', 
  userId: user.id 
});
```

### Step 2: Replace console.warn
```typescript
// Before
console.warn('Rate limit approaching', { remaining: 5 });

// After
log.warn('Rate limit approaching', { 
  feature: 'api', 
  remaining: 5 
});
```

### Step 3: Replace console.error
```typescript
// Before
console.error('Database error:', error);

// After
log.error('Database error', { 
  feature: 'db', 
  error: error.message 
});
```

## Monitoring and Alerting

- **Info logs**: Used for operational monitoring
- **Warn logs**: May trigger alerts for capacity planning
- **Error logs**: Should trigger immediate alerts

## Request ID Propagation

All logs automatically include `requestId` from the request context. This enables tracing requests across services.

## Workspace Context

Include `workspaceId` when available for multi-tenant filtering:

```typescript
log.info('Deal created', { 
  feature: 'deals', 
  dealId: deal.id,
  workspaceId: workspace.id 
});
```

## Performance Considerations

- Logs are structured JSON for easy parsing
- Avoid logging large objects in production
- Use appropriate log levels to control verbosity
- Consider log volume in high-traffic endpoints

## Compliance

- All logs are structured for audit trails
- Sensitive data should be redacted
- Request IDs enable request tracing
- Feature names enable feature-specific monitoring
