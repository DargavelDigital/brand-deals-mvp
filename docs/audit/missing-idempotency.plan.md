# Missing Idempotency Implementation Plan

Generated: 2025-09-26T13:54:39.775Z

## Summary

- **Total Routes**: 170
- **Protected Routes**: 1
- **Missing Idempotency**: 87
- **Exempt Routes**: 22
- **Batches**: 14

## Implementation Strategy

This plan groups routes into small batches (max 8 routes) for easy review and merging. Each batch focuses on a specific domain to minimize conflicts.

### Batch Categories

- **CONTACTS**: contacts
- **OUTREACH**: outreach
- **BRAND-RUN**: brand-run
- **AUDIT**: audit
- **MEDIA-PACK**: media-pack, mediapack
- **MISC**: All other routes

## Implementation Batches

### Batch 1: MISC (8 routes) - High Effort

#### /api/deals
- **File**: `src/app/api/deals/route.ts`
- **Methods**: POST, GET
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/x/refresh
- **File**: `src/app/api/x/refresh/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/x/disconnect
- **File**: `src/app/api/x/disconnect/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/workspaces/export
- **File**: `src/app/api/workspaces/export/route.ts`
- **Methods**: GET, POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/tiktok/status
- **File**: `src/app/api/tiktok/status/route.ts`
- **Methods**: GET, POST, PUT, DELETE
- **Unsafe Methods**: POST, PUT, DELETE

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

2. **Use tx() for multi-write operations**
```typescript
import { tx } from '@/lib/idempotency';

// Wrap database operations with tx()
const result = await tx(async (prisma) => {
  // Your database operations here
});
```

#### /api/util/sign
- **File**: `src/app/api/util/sign/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/tiktok/refresh
- **File**: `src/app/api/tiktok/refresh/route.ts`
- **Methods**: POST, GET
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/tiktok/disconnect
- **File**: `src/app/api/tiktok/disconnect/route.ts`
- **Methods**: POST, GET
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

---

### Batch 2: MISC (8 routes) - High Effort

#### /api/workspaces/purge
- **File**: `src/app/api/workspaces/purge/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/sequence/dispatch
- **File**: `src/app/api/sequence/dispatch/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/sequence/start
- **File**: `src/app/api/sequence/start/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/onlyfans/manual
- **File**: `src/app/api/onlyfans/manual/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/push/subscribe
- **File**: `src/app/api/push/subscribe/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/netfx/playbook
- **File**: `src/app/api/netfx/playbook/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/netfx/aggregate
- **File**: `src/app/api/netfx/aggregate/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/match/top
- **File**: `src/app/api/match/top/route.ts`
- **Methods**: GET, POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

---

### Batch 3: MISC (8 routes) - High Effort

#### /api/match/search
- **File**: `src/app/api/match/search/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/linkedin/refresh
- **File**: `src/app/api/linkedin/refresh/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/linkedin/disconnect
- **File**: `src/app/api/linkedin/disconnect/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/imports/start
- **File**: `src/app/api/imports/start/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/inbox/send-reply
- **File**: `src/app/api/inbox/send-reply/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/imports/run
- **File**: `src/app/api/imports/run/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/imports/map
- **File**: `src/app/api/imports/map/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/invite/verify
- **File**: `src/app/api/invite/verify/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

---

### Batch 4: MISC (8 routes) - High Effort

#### /api/instagram/refresh
- **File**: `src/app/api/instagram/refresh/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/instagram/disconnect
- **File**: `src/app/api/instagram/disconnect/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/feedback/submit
- **File**: `src/app/api/feedback/submit/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/demo/toggle
- **File**: `src/app/api/demo/toggle/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/email/webhook
- **File**: `src/app/api/email/webhook/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/evals/run
- **File**: `src/app/api/evals/run/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/cron/match-refresh
- **File**: `src/app/api/cron/match-refresh/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/deals/redline
- **File**: `src/app/api/deals/redline/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

---

### Batch 5: MISC (8 routes) - High Effort

#### /api/deals/counter-offer
- **File**: `src/app/api/deals/counter-offer/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/deals/log
- **File**: `src/app/api/deals/log/route.ts`
- **Methods**: POST, GET
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/deals/calc
- **File**: `src/app/api/deals/calc/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/deals/[id]
- **File**: `src/app/api/deals/[id]/route.ts`
- **Methods**: PUT, GET
- **Unsafe Methods**: PUT

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const PUT = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/calendar/book
- **File**: `src/app/api/calendar/book/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/calendar/propose
- **File**: `src/app/api/calendar/propose/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/billing/webhook
- **File**: `src/app/api/billing/webhook/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/billing/reset-daily
- **File**: `src/app/api/billing/reset-daily/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

---

### Batch 6: MISC (8 routes) - High Effort

#### /api/billing/checkout
- **File**: `src/app/api/billing/checkout/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/billing/portal
- **File**: `src/app/api/billing/portal/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/agency/revoke-all
- **File**: `src/app/api/agency/revoke-all/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/agency/remove
- **File**: `src/app/api/agency/remove/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/agency/list
- **File**: `src/app/api/agency/list/route.ts`
- **Methods**: GET, POST, DELETE
- **Unsafe Methods**: POST, DELETE

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

2. **Use tx() for multi-write operations**
```typescript
import { tx } from '@/lib/idempotency';

// Wrap database operations with tx()
const result = await tx(async (prisma) => {
  // Your database operations here
});
```

#### /api/agency/invite
- **File**: `src/app/api/agency/invite/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/ai/match
- **File**: `src/app/api/ai/match/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/ai/analyze
- **File**: `src/app/api/ai/analyze/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

---

### Batch 7: MISC (8 routes) - High Effort

#### /api/_util/sign
- **File**: `src/app/api/_util/sign/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/admin/login
- **File**: `src/app/api/admin/login/route.ts`
- **Methods**: POST, GET
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/ai/generate
- **File**: `src/app/api/ai/generate/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/admin/impersonate
- **File**: `src/app/api/admin/impersonate/route.ts`
- **Methods**: POST, DELETE
- **Unsafe Methods**: POST, DELETE

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

2. **Use tx() for multi-write operations**
```typescript
import { tx } from '@/lib/idempotency';

// Wrap database operations with tx()
const result = await tx(async (prisma) => {
  // Your database operations here
});
```

#### /api/admin/bootstrap
- **File**: `src/app/api/admin/bootstrap/route.ts`
- **Methods**: POST, GET
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/imports/[id]/undo
- **File**: `src/app/api/imports/[id]/undo/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/deals/[id]/next-step
- **File**: `src/app/api/deals/[id]/next-step/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/deals/[id]/meta
- **File**: `src/app/api/deals/[id]/meta/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

---

### Batch 8: MISC (5 routes) - Medium Effort

#### /api/admin/retention/run
- **File**: `src/app/api/admin/retention/run/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/admin/retention/policy
- **File**: `src/app/api/admin/retention/policy/route.ts`
- **Methods**: GET, POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/admin/exports/start
- **File**: `src/app/api/admin/exports/start/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/inbox/threads/[id]/reply
- **File**: `src/app/api/inbox/threads/[id]/reply/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/admin/runs/[runId]/steps/[stepExecId]/replay
- **File**: `src/app/api/admin/runs/[runId]/steps/[stepExecId]/replay/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

---

### Batch 9: CONTACTS (8 routes) - High Effort

#### /api/contacts
- **File**: `src/app/api/contacts/route.ts`
- **Methods**: GET, POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/contacts/import
- **File**: `src/app/api/contacts/import/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/contacts/merge
- **File**: `src/app/api/contacts/merge/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/contacts/export
- **File**: `src/app/api/contacts/export/route.ts`
- **Methods**: GET, POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/contacts/enrich
- **File**: `src/app/api/contacts/enrich/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/contacts/bulk-tag
- **File**: `src/app/api/contacts/bulk-tag/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/contacts/bulk
- **File**: `src/app/api/contacts/bulk/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/contacts/[id]
- **File**: `src/app/api/contacts/[id]/route.ts`
- **Methods**: GET, PUT, PATCH, DELETE
- **Unsafe Methods**: PUT, PATCH, DELETE

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const PUT = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

2. **Use tx() for multi-write operations**
```typescript
import { tx } from '@/lib/idempotency';

// Wrap database operations with tx()
const result = await tx(async (prisma) => {
  // Your database operations here
});
```

---

### Batch 10: CONTACTS (3 routes) - Low Effort

#### /api/contacts/bulk-delete
- **File**: `src/app/api/contacts/bulk-delete/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/contacts/[id]/tasks
- **File**: `src/app/api/contacts/[id]/tasks/route.ts`
- **Methods**: GET, POST, PUT
- **Unsafe Methods**: POST, PUT

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

2. **Use tx() for multi-write operations**
```typescript
import { tx } from '@/lib/idempotency';

// Wrap database operations with tx()
const result = await tx(async (prisma) => {
  // Your database operations here
});
```

#### /api/contacts/[id]/notes
- **File**: `src/app/api/contacts/[id]/notes/route.ts`
- **Methods**: GET, POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

---

### Batch 11: OUTREACH (5 routes) - Medium Effort

#### /api/outreach/start
- **File**: `src/app/api/outreach/start/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/outreach/inbound
- **File**: `src/app/api/outreach/inbound/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/outreach/webhooks/resend
- **File**: `src/app/api/outreach/webhooks/resend/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/outreach/inbox/reply
- **File**: `src/app/api/outreach/inbox/reply/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/outreach/conversations/[id]/reply
- **File**: `src/app/api/outreach/conversations/[id]/reply/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

---

### Batch 12: MEDIA-PACK (3 routes) - Low Effort

#### /api/media-pack/track
- **File**: `src/app/api/media-pack/track/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/media-pack/generate-pdf
- **File**: `src/app/api/media-pack/generate-pdf/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/media-pack/share
- **File**: `src/app/api/media-pack/share/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

---

### Batch 13: BRAND-RUN (4 routes) - Medium Effort

#### /api/brand-run/upsert
- **File**: `src/app/api/brand-run/upsert/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/brand-run/one-touch
- **File**: `src/app/api/brand-run/one-touch/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/brand-run/start
- **File**: `src/app/api/brand-run/start/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

#### /api/brand-run/advance
- **File**: `src/app/api/brand-run/advance/route.ts`
- **Methods**: POST
- **Unsafe Methods**: POST

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

---

### Batch 14: AUDIT (3 routes) - Low Effort

#### /api/audit/status
- **File**: `src/app/api/audit/status/route.ts`
- **Methods**: GET, POST, PUT, DELETE
- **Unsafe Methods**: POST, PUT, DELETE

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

2. **Use tx() for multi-write operations**
```typescript
import { tx } from '@/lib/idempotency';

// Wrap database operations with tx()
const result = await tx(async (prisma) => {
  // Your database operations here
});
```

#### /api/audit/latest
- **File**: `src/app/api/audit/latest/route.ts`
- **Methods**: GET, POST, PUT, DELETE
- **Unsafe Methods**: POST, PUT, DELETE

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

2. **Use tx() for multi-write operations**
```typescript
import { tx } from '@/lib/idempotency';

// Wrap database operations with tx()
const result = await tx(async (prisma) => {
  // Your database operations here
});
```

#### /api/audit/get
- **File**: `src/app/api/audit/get/route.ts`
- **Methods**: GET, POST, PUT, DELETE
- **Unsafe Methods**: POST, PUT, DELETE

**Implementation Suggestions:**

1. **Wrap handler with withIdempotency()**
```typescript
import { withIdempotency } from '@/lib/idempotency';

export const POST = withIdempotency(async (request) => {
  // Your existing handler code here
});
```

2. **Use tx() for multi-write operations**
```typescript
import { tx } from '@/lib/idempotency';

// Wrap database operations with tx()
const result = await tx(async (prisma) => {
  // Your database operations here
});
```

---

## Implementation Checklist

For each batch:

- [ ] Review the routes and their current implementation
- [ ] Add `withIdempotency` wrapper to route handlers
- [ ] Use `tx()` for multi-write operations
- [ ] Test idempotency behavior (duplicate requests return same result)
- [ ] Update middleware allowlist if needed
- [ ] Create PR with batch changes
- [ ] Mark batch as complete in this plan

## Notes

- Routes are grouped by domain to minimize merge conflicts
- Each batch should be small enough for easy review
- Test idempotency by making duplicate requests with the same `Idempotency-Key`
- Consider adding route-specific allowlist entries for routes that legitimately don't need idempotency
