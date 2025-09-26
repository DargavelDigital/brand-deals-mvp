# Missing Idempotency Implementation Plan

Generated: 2025-09-26T16:26:17.286Z

## Summary

- **Total Routes**: 173
- **Protected Routes**: 7
- **Missing Idempotency**: 0
- **Exempt Routes**: 25
- **Batches**: 0

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
