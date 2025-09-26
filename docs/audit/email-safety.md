# Email Safety Report

Generated: 2025-09-26T10:49:37.092Z

## Email Providers (22)

### Resend
- **File**: `app/api/debug/diag/route.ts:21`
- **Status**: ✅ Detected


### SendGrid
- **File**: `app/api/debug/diag/route.ts:22`
- **Status**: ✅ Detected


### Resend
- **File**: `app/api/email/unsubscribe/request/route.ts:4`
- **Status**: ✅ Detected


### Blackhole
- **File**: `app/api/inbox/threads/[id]/reply/route.ts:45`
- **Status**: ✅ Detected


### Resend
- **File**: `app/api/outreach/conversations/[id]/reply/route.ts:3`
- **Status**: ✅ Detected


### Resend
- **File**: `app/api/outreach/queue/route.ts:4`
- **Status**: ✅ Detected


### Resend
- **File**: `app/api/outreach/webhooks/resend/route.ts:9`
- **Status**: ✅ Detected


### Resend
- **File**: `components/run/StepOutreach.tsx:16`
- **Status**: ✅ Detected


### Resend
- **File**: `lib/env.ts:38`
- **Status**: ✅ Detected


### SendGrid
- **File**: `lib/env.ts:37`
- **Status**: ✅ Detected


### SMTP
- **File**: `lib/env.ts:39`
- **Status**: ✅ Detected


### Blackhole
- **File**: `lib/epic0-demo.ts:60`
- **Status**: ✅ Detected


### Blackhole
- **File**: `services/email/policies.ts:49`
- **Status**: ✅ Detected


### Resend
- **File**: `services/email/provider.resend.ts:1`
- **Status**: ✅ Detected


### SendGrid
- **File**: `services/email/sender.ts:1`
- **Status**: ✅ Detected


### SMTP
- **File**: `services/email/sender.ts:28`
- **Status**: ✅ Detected


### Blackhole
- **File**: `services/providers/demo.ts:45`
- **Status**: ✅ Detected


### Blackhole
- **File**: `services/email/policies.ts:49`
- **Status**: ✅ Detected


### Resend
- **File**: `services/email/provider.resend.ts:1`
- **Status**: ✅ Detected


### SendGrid
- **File**: `services/email/sender.ts:1`
- **Status**: ✅ Detected


### SMTP
- **File**: `services/email/sender.ts:28`
- **Status**: ✅ Detected


### Resend
- **File**: `app/api/email/unsubscribe/request/route.ts:4`
- **Status**: ✅ Detected


## Safety Features
- **Unsubscribe Handling**: ✅ Implemented
- **Footer/Signature**: ✅ Implemented
- **From/Reply-To**: ✅ Implemented
- **Daily Caps**: ✅ Implemented
- **Domain Guards**: ✅ Implemented
- **Suppression Handling**: ✅ Implemented

## Configuration
- **fromEmail**: `john@acmecorp.com`
- **replyTo**: `${threadKey}@${domain}`

## Environment Variables
- **RESEND_API_KEY**: ❌ Not set
- **SENDGRID_API_KEY**: ❌ Not set
- **SMTP_HOST**: ❌ Not set
- **SMTP_PORT**: ❌ Not set
- **SMTP_USER**: ❌ Not set
- **SMTP_PASS**: ❌ Not set
- **EMAIL_FROM**: ❌ Not set
- **EMAIL_REPLY_TO**: ❌ Not set

## Summary
- **Providers Detected**: 22
- **Safety Features Implemented**: 6/6
- **Configuration Items**: 2
- **Environment Variables Set**: 0

## Recommendations








