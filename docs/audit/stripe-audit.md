# Stripe Audit Report

Generated: 2025-09-26T10:49:37.223Z

## Webhooks (5)

### Stripe Webhook
- **File**: `app/api/billing/webhook/route.ts:25`
- **Signature Verification**: ✅ Implemented
- **Duplicate Event Protection**: ❌ Missing
- **Error Handling**: ✅ Implemented
- **Events**: None detected


### Stripe Webhook
- **File**: `app/api/stripe/webhook/route.ts:17`
- **Signature Verification**: ✅ Implemented
- **Duplicate Event Protection**: ✅ Implemented
- **Error Handling**: ✅ Implemented
- **Events**: None detected


### Stripe Webhook
- **File**: `lib/env.ts:28`
- **Signature Verification**: ❌ Missing
- **Duplicate Event Protection**: ❌ Missing
- **Error Handling**: ❌ Missing
- **Events**: None detected


### Stripe Webhook
- **File**: `app/api/stripe/webhook/route.ts:17`
- **Signature Verification**: ✅ Implemented
- **Duplicate Event Protection**: ✅ Implemented
- **Error Handling**: ✅ Implemented
- **Events**: None detected


### Stripe Webhook
- **File**: `app/api/billing/webhook/route.ts:25`
- **Signature Verification**: ✅ Implemented
- **Duplicate Event Protection**: ❌ Missing
- **Error Handling**: ✅ Implemented
- **Events**: None detected


## Billing Configuration
- **Billing Enabled**: ✅ Enabled
- **Secret Key**: ✅ Configured
- **Plan Gates**: ✅ Found

### Plan Gates (6)

- **Pattern**: `entitlement`
- **File**: `ai/invoke.ts:461`


- **Pattern**: `billing.*check`
- **File**: `app/[locale]/billing/page.tsx:1983`


- **Pattern**: `billing.*check`
- **File**: `app/[locale]/settings/billing/page.tsx:1849`


- **Pattern**: `entitlement`
- **File**: `app/api/outreach/queue/route.ts:362`


- **Pattern**: `entitlement`
- **File**: `app/api/stripe/webhook/route.ts:185`


- **Pattern**: `entitlement`
- **File**: `services/billing/index.ts:158`


## Security Features
- **Signature Verification**: ✅ Implemented
- **Duplicate Event Protection**: ✅ Implemented
- **Error Handling**: ✅ Implemented

## Environment Variables
- **STRIPE_SECRET_KEY**: ❌ Not set
- **STRIPE_PUBLISHABLE_KEY**: ❌ Not set
- **STRIPE_WEBHOOK_SECRET**: ❌ Not set
- **STRIPE_WEBHOOK_ENDPOINT_SECRET**: ❌ Not set

## Summary
- **Webhooks Found**: 5
- **Billing Enabled**: Yes
- **Security Features**: 3/3
- **Environment Variables Set**: 0

## Recommendations








