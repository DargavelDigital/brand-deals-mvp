# Audit Summary Report

Generated: 2025-09-26T11:06:32.943Z

## Overall Status

| Category | Status | Issues |
|----------|--------|--------|
| **Auth** | 🟢 GREEN | 0 |
| **Writes/Transactions** | 🔴 RED | 2 |
| **Jobs/Idempotency** | 🟢 GREEN | 0 |
| **Email Safety** | 🟢 GREEN | 0 |
| **Stripe/Webhooks** | 🟢 GREEN | 0 |
| **MediaPack Runtime** | 🟢 GREEN | 0 |
| **Env/Flags** | 🟢 GREEN | 0 |
| **Observability** | 🟢 GREEN | 0 |
| **Security** | 🟢 GREEN | 0 |
| **BrandRun Coverage** | 🟢 GREEN | 0 |

## Detailed Issues

### 🔴 RED (Must Fix Before Production)

#### Writes
- ❌ 71 risky write patterns detected
- ❌ 34 routes missing idempotency protection


### 🟡 AMBER (Fix Soon)


### 🟢 GREEN (OK)

#### Auth
✅ No issues detected


#### Jobs
✅ No issues detected


#### Email
✅ No issues detected


#### Stripe
✅ No issues detected


#### Mediapack
✅ No issues detected


#### Env
✅ No issues detected


#### Obs
✅ No issues detected


#### Security
✅ No issues detected


#### Brandrun
✅ No issues detected


## Audit Artifacts

- **doctor**: ✅ Loaded (2025-09-26T10:49:32.191Z)


- **inventory-routes**: ✅ Loaded (2025-09-26T10:49:36.687Z)


- **inventory-writes**: ✅ Loaded (2025-09-26T11:04:06.459Z)


- **env-flags**: ✅ Loaded (2025-09-26T10:49:36.908Z)


- **jobs**: ✅ Loaded (2025-09-26T10:49:37.001Z)


- **email-safety**: ✅ Loaded (2025-09-26T10:49:37.092Z)


- **stripe-audit**: ✅ Loaded (2025-09-26T10:49:37.223Z)


- **mediapack-audit**: ✅ Loaded (2025-09-26T10:49:37.410Z)


- **observability**: ✅ Loaded (2025-09-26T10:49:37.667Z)


- **security**: ✅ Loaded (2025-09-26T10:49:37.781Z)


- **brandrun-trace**: ✅ Loaded (2025-09-25T10:56:39.051Z)


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
- **Total Categories**: 10
- **Green Status**: 9
- **Amber Status**: 0
- **Red Status**: 1
- **Total Issues**: 2


