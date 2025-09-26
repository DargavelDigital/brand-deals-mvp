# Security Report

Generated: 2025-09-26T10:49:37.781Z

## Content Security Policy (CSP)
- **Configured**: ✅ Yes
- **Violations**: 1

### Potential CSP Violations

- **File**: `app/[locale]/demo/feedback/page.tsx:14`
- **Pattern**: `setTimeout\s*\([^,]*['"`]`
- **Content**: `setTimeout(() => setFeedbackSubmitted(''), 5000);`


## CSRF Protection
- **Protection**: ✅ Implemented
- **SameSite**: ✅ Configured
- **Secure Cookies**: ✅ Configured

## Input Validation
- **Zod Usage**: ✅ Implemented
- **Validators Found**: 58

### Validation Implementations

- **Validation Function**: `ai/promptPacks/deals.redline.v1.ts:7121`


- **Validation Function**: `ai/promptPacks/outreach.counterOffer.v1.ts:5333`


- **Schema Parse**: `app/(admin)/admin/stabilization/page.tsx:1574`


- **Validation Function**: `app/api/admin/bootstrap/route.ts:122`


- **Schema Parse**: `app/api/agency/list/route.ts:2816`


- **Zod Schema**: `app/api/ai/analyze/route.ts:582`


- **Schema Parse**: `app/api/ai/analyze/route.ts:1324`


- **Schema Safe Parse**: `app/api/ai/analyze/route.ts:1013`


- **Zod Schema**: `app/api/ai/generate/route.ts:580`


- **Schema Parse**: `app/api/ai/generate/route.ts:1380`


- **Schema Safe Parse**: `app/api/ai/generate/route.ts:1057`


- **Zod Schema**: `app/api/ai/match/route.ts:579`


- **Schema Parse**: `app/api/ai/match/route.ts:1581`


- **Schema Safe Parse**: `app/api/ai/match/route.ts:1041`


- **Validation Function**: `app/api/brand-run/advance/route.ts:507`


- **Validation Function**: `app/api/brand-run/start/route.ts:582`


- **Validation Function**: `app/api/contacts/bulk/route.ts:1052`


- **Zod Schema**: `app/api/contacts/route.ts:1096`


- **Schema Parse**: `app/api/contacts/route.ts:3555`


- **Schema Safe Parse**: `app/api/contacts/route.ts:3713`


- **Validation Function**: `app/api/deals/[id]/meta/route.ts:687`


- **Zod Schema**: `app/api/deals/calc/route.ts:215`


- **Validation Function**: `app/api/deals/calc/route.ts:657`


- **Schema Parse**: `app/api/deals/calc/route.ts:690`


- **Zod Schema**: `app/api/deals/counter-offer/route.ts:223`


- **Validation Function**: `app/api/deals/counter-offer/route.ts:1118`


- **Schema Parse**: `app/api/deals/counter-offer/route.ts:1159`


- **Zod Schema**: `app/api/deals/log/route.ts:375`


- **Validation Function**: `app/api/deals/log/route.ts:1001`


- **Schema Parse**: `app/api/deals/log/route.ts:1037`


- **Zod Schema**: `app/api/deals/redline/route.ts:218`


- **Validation Function**: `app/api/deals/redline/route.ts:755`


- **Schema Parse**: `app/api/deals/redline/route.ts:791`


- **Validation Function**: `app/api/deals/route.ts:635`


- **Validation Function**: `app/api/feedback/submit/route.ts:550`


- **Validation Function**: `app/api/feedback/summary/route.ts:1227`


- **Schema Safe Parse**: `app/api/feedback/summary/route.ts:2241`


- **Schema Parse**: `app/api/imports/start/route.ts:755`


- **Validation Function**: `app/api/media-pack/download/[packId]/route.ts:1638`


- **Validation Function**: `app/api/outreach/inbox/reply/route.ts:647`


- **Schema Parse**: `app/api/tiktok/refresh/route.ts:2197`


- **Schema Parse**: `app/api/tiktok/status/route.ts:1097`


- **Validation Function**: `lib/admin/bootstrap.ts:3951`


- **Zod Schema**: `lib/env.ts:103`


- **Schema Safe Parse**: `lib/env.ts:5130`


- **Validation Function**: `lib/http/envelope.test.ts:845`


- **Validation Function**: `lib/http/safeJson.ts:127`


- **Validation Function**: `services/ai/openai.ts:3006`


- **Schema Parse**: `services/ai/openai.ts:3598`


- **Zod Schema**: `services/linkedin/api.ts:812`


- **Schema Parse**: `services/linkedin/api.ts:1535`


- **Schema Parse**: `services/onlyfans/client.ts:972`


- **Zod Schema**: `services/onlyfans/types.ts:51`


- **Schema Parse**: `services/social/providers/tiktok.ts:462`


- **Zod Schema**: `services/tiktok/api.ts:366`


- **Schema Parse**: `services/tiktok/api.ts:1748`


- **Zod Schema**: `services/x/api.ts:1338`


- **Schema Parse**: `services/x/api.ts:2109`


### Missing Validation

- **File**: `app/api/admin/exports/start/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/admin/retention/policy/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/admin/runs/[runId]/steps/[stepExecId]/replay/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/agency/invite/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/agency/remove/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/agency/revoke-all/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/audit/run/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/audit/status/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/billing/checkout/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/billing/reset-daily/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/billing/webhook/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/brand-run/current/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/brand-run/one-touch/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/brand-run/upsert/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/contacts/[id]/notes/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/contacts/[id]/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/contacts/[id]/tasks/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/contacts/bulk-delete/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/contacts/bulk-tag/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/contacts/import/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/cron/check-reminders/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/deals/[id]/next-step/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/deals/[id]/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/email/unsubscribe/request/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/email/webhook/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/imports/[id]/undo/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/imports/map/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/imports/run/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/inbox/send-reply/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/inbox/threads/[id]/reply/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/media-pack/generate/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/media-pack/track/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/outreach/conversations/[id]/reply/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/outreach/inbound/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/outreach/queue/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/outreach/webhooks/resend/route.ts`
- **Reason**: Write route without input validation


- **File**: `app/api/stripe/webhook/route.ts`
- **Reason**: Write route without input validation


## Webhook Security
### Signature Checks (0)


### Token Checks (20)

- **API Token**: `app/api/email/unsubscribe/request/route.ts:1449`


- **Cron Token**: `app/api/outreach/queue/route.ts:1201`


- **API Token**: `app/api/tiktok/auth/callback/route.ts:650`


- **Auth Token**: `app/api/tiktok/auth/callback/route.ts:592`


- **API Token**: `middleware.ts:1091`


- **Auth Token**: `middleware.ts:4602`


- **Auth Token**: `services/instagram/graph.ts:760`


- **Auth Token**: `services/linkedin/api.ts:1077`


- **Bearer Token**: `services/linkedin/api.ts:2388`


- **API Token**: `services/onlyfans/client.ts:1136`


- **Auth Token**: `services/onlyfans/client.ts:817`


- **Bearer Token**: `services/onlyfans/client.ts:869`


- **Auth Token**: `services/social/providers/tiktok.ts:1260`


- **Bearer Token**: `services/social/providers/tiktok.ts:1276`


- **API Token**: `services/tiktok/api.ts:3547`


- **Auth Token**: `services/tiktok/api.ts:3561`


- **Bearer Token**: `services/tiktok/api.ts:5051`


- **API Token**: `services/x/api.ts:1655`


- **Auth Token**: `services/x/api.ts:1671`


- **Bearer Token**: `services/x/api.ts:2838`


## Rate Limiting
- **Middleware**: ✅ Implemented
- **Implementations**: 3

### Rate Limiting Implementations

- **Next.js Rate Limit**: `app/api/ai/analyze/route.ts:881`


- **Next.js Rate Limit**: `app/api/ai/generate/route.ts:925`


- **Next.js Rate Limit**: `app/api/ai/match/route.ts:909`


## Summary
- **CSP Configured**: Yes
- **CSP Violations**: 1
- **CSRF Protection**: Yes
- **Input Validation**: Yes
- **Missing Validation**: 37
- **Webhook Security**: 20
- **Rate Limiting**: Yes

## Recommendations

- ⚠️ **Fix 1 CSP violations**




- ❌ **Add validation to 37 write routes**
- ❌ **Implement webhook signature verification**




## Errors
- ❌ Error reading directory src/middleware.ts: ENOTDIR: not a directory, scandir 'src/middleware.ts'

