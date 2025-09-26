# Idempotency Gate Middleware

The Idempotency Gate middleware enforces `Idempotency-Key` headers for unsafe HTTP methods on API routes, helping prevent duplicate operations and ensuring data consistency.

## Overview

The middleware operates in three modes and provides a gradual migration path from warning to enforcement:

- **`off`**: No enforcement (disabled)
- **`warn`**: Add warning header but allow request to proceed
- **`enforce`**: Return 428 Precondition Required if no `Idempotency-Key` header

## Configuration

### Environment Variable

Set the `FEATURE_IDEMPOTENCY_GATE` environment variable to control the mode:

```bash
# Disable idempotency gate
FEATURE_IDEMPOTENCY_GATE=off

# Warn mode (adds warning header)
FEATURE_IDEMPOTENCY_GATE=warn

# Enforce mode (blocks requests without key)
FEATURE_IDEMPOTENCY_GATE=enforce
```

### Default Behavior

If `FEATURE_IDEMPOTENCY_GATE` is not set, the middleware uses environment-based defaults:

- **Production**: `enforce` (strict enforcement)
- **Development**: `warn` (warning only)
- **Preview/Other**: `off` (disabled)

### Allowlist Configuration

The middleware uses a hardcoded allowlist for Edge Runtime compatibility. To modify the allowlist, edit the `allowlistPatterns` array in `src/middleware-idempotency-gate.ts`:

```typescript
const allowlistPatterns = [
  '/api/webhooks/*',
  '/api/health',
  '/api/debug/*',
  '/api/auth/*',
  '/api/email/unsubscribe/*'
];
```

**Pattern Syntax:**
- `*` matches any non-slash characters
- `**` matches any path (including slashes)
- `?` matches any single character

**Note**: In production, this could be loaded from environment variables or a CDN for dynamic configuration.

## Behavior

### Routes Affected

The middleware only applies to:
- API routes (paths starting with `/api/`)
- Unsafe HTTP methods: `POST`, `PUT`, `PATCH`, `DELETE`

### Exemptions

Routes are exempt from idempotency requirements if they:
1. Match a pattern in the allowlist
2. Are already wrapped with `withIdempotency()` in their route handler (detected via hardcoded list)
3. Use safe HTTP methods (`GET`, `HEAD`, `OPTIONS`)

**Wrapped Routes Detection**: The middleware maintains a hardcoded list of routes known to use `withIdempotency()`. To add new routes, update the `wrappedRoutes` array in `src/middleware-idempotency-gate.ts`.

### Response Headers

#### Warning Mode
When a request lacks an `Idempotency-Key` header:
```
X-Idempotency-Warning: missing-key
```

#### Enforce Mode
When a request lacks an `Idempotency-Key` header:
```json
{
  "ok": false,
  "code": "IDEMPOTENCY_KEY_REQUIRED",
  "message": "Idempotency-Key header is required for this operation"
}
```
**Status Code**: `428 Precondition Required`

### Request ID Propagation

The middleware ensures that every request has a `request-id` header and stores it in AsyncLocalStorage for use in route handlers.

## Migration Strategy

### Phase 1: Warning (Development)
1. Set `FEATURE_IDEMPOTENCY_GATE=warn` in development
2. Monitor logs for `X-Idempotency-Warning` headers
3. Add `Idempotency-Key` headers to client requests
4. Update routes to use `withIdempotency()` wrapper

### Phase 2: Enforcement (Production)
1. Set `FEATURE_IDEMPOTENCY_GATE=enforce` in production
2. Monitor for 428 errors
3. Add allowlist entries for routes that legitimately don't need idempotency

### Phase 3: Optimization
1. Remove allowlist entries for routes that now use `withIdempotency()`
2. Consider making idempotency mandatory for all unsafe operations

## Client Integration

### Adding Idempotency Keys

Clients should include an `Idempotency-Key` header for all unsafe operations:

```javascript
// Generate a unique key for each operation
const idempotencyKey = crypto.randomUUID();

fetch('/api/brand-run/upsert', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Idempotency-Key': idempotencyKey
  },
  body: JSON.stringify(data)
});
```

### Handling 428 Responses

Clients should handle 428 responses by adding the required header:

```javascript
try {
  const response = await fetch('/api/some-endpoint', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  
  if (response.status === 428) {
    // Retry with Idempotency-Key header
    const retryResponse = await fetch('/api/some-endpoint', {
      method: 'POST',
      headers: {
        'Idempotency-Key': crypto.randomUUID()
      },
      body: JSON.stringify(data)
    });
    return retryResponse;
  }
  
  return response;
} catch (error) {
  // Handle other errors
}
```

## Monitoring

### Logs to Watch

1. **Warning Headers**: Look for `X-Idempotency-Warning` in response headers
2. **428 Errors**: Monitor for `IDEMPOTENCY_KEY_REQUIRED` errors
3. **Allowlist Hits**: Routes matching allowlist patterns (logged in middleware)

### Metrics to Track

- Number of requests with missing `Idempotency-Key` headers
- Number of 428 responses returned
- Number of routes using `withIdempotency()` wrapper
- Allowlist pattern matches

## Troubleshooting

### Common Issues

1. **False Positives**: Routes that don't need idempotency are being flagged
   - **Solution**: Add route pattern to allowlist

2. **Missing Headers**: Clients not sending `Idempotency-Key` headers
   - **Solution**: Update client code to include headers

3. **Route Detection**: Routes wrapped with `withIdempotency()` still being flagged
   - **Solution**: Ensure route files contain `withIdempotency` string

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` to see detailed middleware logs.

## Security Considerations

- The middleware is read-only and doesn't modify the database
- Request IDs are generated using `crypto.randomUUID()` for security
- Allowlist patterns are validated to prevent path traversal attacks
- The middleware runs before authentication, so it can't access user context
