# Idempotency System

This document describes the idempotency system implemented to prevent duplicate effects and ensure safe multi-write operations.

## Overview

The idempotency system provides:
- **Duplicate request protection** using `Idempotency-Key` headers
- **Multi-write transaction safety** with the `tx()` helper
- **Automatic 409 responses** for duplicate requests
- **ESLint enforcement** of transaction usage

## Idempotency Key Usage

### Client-Side

Always include an `Idempotency-Key` header for state-changing requests:

```javascript
// Good: Include idempotency key
const response = await fetch('/api/media-pack/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Idempotency-Key': 'media-pack-123-v1'
  },
  body: JSON.stringify({ packId: '123', variant: 'classic' })
})

// Bad: Missing idempotency key (will fail in production)
const response = await fetch('/api/media-pack/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ packId: '123', variant: 'classic' })
})
```

### Key Generation

Generate stable, unique keys:

```javascript
// Option 1: Use resource ID + version
const key = `media-pack-${packId}-${version}`

// Option 2: Use content hash
const content = JSON.stringify({ packId, variant, workspaceId })
const key = `media-pack-${hashContent(content)}`

// Option 3: Use timestamp + random
const key = `media-pack-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
```

## Server-Side Implementation

### Route Protection

Wrap state-changing routes with `withIdempotency`:

```typescript
import { withIdempotency, tx } from '@/lib/idempotency'

async function handlePOST(req: NextRequest) {
  // Your route logic here
  // Use tx() for multi-write operations
}

export const POST = withIdempotency(handlePOST)
```

### Multi-Write Operations

Always wrap multiple database writes in transactions:

```typescript
// Good: Use tx() helper
await tx(async (p) => {
  await p.mediaPack.create({ data: { id, workspaceId } })
  await p.audit.create({ data: { mediaPackId: id } })
  await p.workspace.update({ where: { id: workspaceId }, data: { lastActivity: new Date() } })
})

// Bad: Multiple writes without transaction
await prisma.mediaPack.create({ data: { id, workspaceId } })
await prisma.audit.create({ data: { mediaPackId: id } })
await prisma.workspace.update({ where: { id: workspaceId }, data: { lastActivity: new Date() } })
```

## Response Behavior

### Successful Request (200/201)

```json
{
  "ok": true,
  "data": { /* response data */ }
}
```

**Headers:**
- `X-Idempotency-Key`: The idempotency key used
- `Content-Type`: `application/json`

### Duplicate Request (409)

```json
{
  "ok": false,
  "code": "DUPLICATE",
  "message": "Request already processed",
  "idempotencyKey": "media-pack-123-v1"
}
```

**Headers:**
- `X-Idempotency-Key`: The idempotency key used
- `Location`: Path to the resource (if applicable)
- `Content-Type`: `application/json`

## Development vs Production

### Development Mode

- **Automatic key generation**: If no `Idempotency-Key` header is provided, a key is generated from request hash
- **Relaxed enforcement**: Missing keys don't cause errors
- **Debug logging**: Detailed logs for idempotency operations

### Production Mode

- **Strict enforcement**: `Idempotency-Key` header is required for all state-changing requests
- **No automatic generation**: Missing keys result in 400 errors
- **Performance optimized**: Minimal logging overhead

## ESLint Rule

The `no-multiwrite-without-tx` rule automatically detects functions with multiple Prisma write operations without transactions:

```typescript
// ❌ ESLint Error: Multiple Prisma write operations detected without transaction
async function badExample() {
  await prisma.user.create({ data: { name: 'John' } })
  await prisma.audit.create({ data: { action: 'user_created' } })
  await prisma.workspace.update({ where: { id: 'ws1' }, data: { userCount: 1 } })
}

// ✅ Good: Uses transaction
async function goodExample() {
  await tx(async (p) => {
    await p.user.create({ data: { name: 'John' } })
    await p.audit.create({ data: { action: 'user_created' } })
    await p.workspace.update({ where: { id: 'ws1' }, data: { userCount: 1 } })
  })
}
```

## Protected Routes

The following routes are protected with idempotency:

- `POST /api/media-pack/generate` - Media pack generation
- `POST /api/audit/run` - Audit execution
- `POST /api/outreach/queue` - Outreach email processing
- `POST /api/outreach/start` - Outreach sequence start
- `POST /api/sequence/start` - Sequence initialization
- `POST /api/contacts/enrich` - Contact enrichment
- `POST /api/brand-run/upsert` - Brand run creation/update
- `POST /api/stripe/webhook` - Stripe webhook processing
- `POST /api/billing/webhook` - Billing webhook processing

## Database Schema

The system uses the existing `DedupeFingerprint` model:

```prisma
model DedupeFingerprint {
  id           String   @id @default(cuid())
  workspaceId  String
  entity       String   // 'REQUEST:POST:/api/media-pack/generate'
  key          String   // idempotency key
  entityId     String   // same as key for request tracking
  createdAt    DateTime @default(now())
  
  @@unique([workspaceId, entity, key])
  @@index([workspaceId, entity])
}
```

## Cleanup

Old idempotency records are automatically cleaned up:

```typescript
import { cleanupIdempotencyRecords } from '@/lib/idempotency'

// Clean up records older than 7 days
await cleanupIdempotencyRecords(7)
```

## Monitoring

All idempotency operations are logged with structured JSON:

```json
{
  "ts": "2024-01-15T13:10:07.123Z",
  "level": "info",
  "msg": "Request processed with idempotency",
  "requestId": "req-123",
  "feature": "idempotency",
  "key": "media-pack-123-v1",
  "path": "/api/media-pack/generate",
  "workspaceId": "ws-456",
  "status": 200,
  "totalTimeMs": 1500
}
```

## Best Practices

1. **Always use idempotency keys** for state-changing operations
2. **Wrap multi-write operations** in transactions
3. **Generate stable keys** that don't change between retries
4. **Handle 409 responses** gracefully in your client code
5. **Use the ESLint rule** to catch violations automatically
6. **Monitor idempotency metrics** for duplicate request rates

## Troubleshooting

### Common Issues

1. **"Idempotency-Key header required"**
   - Add the header to your request
   - Ensure you're not in production mode during development

2. **"Multiple Prisma write operations detected"**
   - Wrap your database operations in `tx()`
   - Check that all writes are within the transaction

3. **Unexpected 409 responses**
   - Check if the same idempotency key was used before
   - Verify the key is unique for each distinct operation

### Debug Mode

Enable debug logging by setting:

```bash
NODE_ENV=development
```

This will show detailed idempotency operations and automatic key generation.
