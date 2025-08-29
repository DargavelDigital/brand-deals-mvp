# EPIC 16 - Quality & Scale (SLOs, Tests, Performance)

## 🎯 Overview

EPIC 16 implements a comprehensive quality and scale foundation for production reliability:

- **Green-gated deploys** with deterministic E2E tests
- **Latency budgets** with k6 performance testing and Slack alerts
- **Safe data operations** with nightly backups and migration smoke tests
- **Performance observability** with trace IDs and duration logging

## 🚀 Quick Start

### Local E2E Testing
```bash
# Setup test database
pnpm migrate:deploy
pnpm db:seed:test

# Run E2E tests
pnpm e2e:ci
```

### Performance Testing
```bash
# Start test server
pnpm dev:3001

# Run performance tests
BASE_URL=http://localhost:3001 pnpm perf:matches
BASE_URL=http://localhost:3001 pnpm perf:audit
BASE_URL=http://localhost:3001 pnpm perf:outreach
```

### Database Operations
```bash
# Smoke test database
pnpm db:smoke

# Restore from backup
DATABASE_URL=postgres://... ./scripts/restore-local.sh s3://bucket/pg/timestamp.dump
```

## 📊 SLOs & Performance Budgets

| Endpoint | P95 Latency | Load Test | Threshold |
|----------|-------------|-----------|-----------|
| `/api/match/top` | < 800ms | 20 RPS constant | ✅ Enforced |
| `/api/outreach/start` | < 1.5s | 10 VUs burst | ✅ Enforced |
| `/api/audit/run` | < 5s | 5→20→0 VUs spike | ✅ Enforced |

**Performance gates:** CI fails on regressions, Slack alerts on perf workflow failures.

## 🧪 E2E Test Suite

### Test Coverage
- **One-Touch Brand Run** → Progress tracking → Outreach review
- **Component interactions** with stable test IDs
- **Cross-browser compatibility** (Chromium)

### Test IDs Added
```tsx
// Dashboard
<Button data-testid="one-touch-btn">One-Touch Brand Run</Button>

// Progress tracking
<div data-testid="progress-sheet">...</div>

// Outreach
<button data-testid="start-sequence">Start Sequence</button>
<button data-testid="review-send">Review & Send</button>
```

### Running Tests
```bash
# Full E2E suite
pnpm e2e

# Headed mode (for debugging)
pnpm e2e:headed

# CI mode (build + start + test)
pnpm e2e:ci
```

## 📈 Performance Testing (k6)

### Test Scenarios
- **Matches API**: 20 RPS constant load, P95 < 800ms
- **Audit API**: 5→20→0 VU spike, P95 < 5s  
- **Outreach API**: 10 VU burst, P95 < 1.5s

### Local Performance Testing
```bash
# Start test server
pnpm dev:3001

# Run specific tests
pnpm perf:matches    # Match API performance
pnpm perf:audit      # Audit API performance  
pnpm perf:outreach   # Outreach API performance
```

### CI Performance Gates
- **Daily automated testing** at 03:00 UTC
- **Slack notifications** on threshold failures
- **Manual triggers** via GitHub Actions

## 💾 Database Operations

### Automated Backups
- **Nightly backups** to S3/R2 at 02:00 UTC
- **Compressed format** with AES256 encryption
- **Retention**: Configurable via S3 lifecycle policies

### Migration Safety
- **Pre-merge smoke tests** for all Prisma changes
- **Ephemeral PostgreSQL** instances in CI
- **Rollback safety** with backup verification

### Restore Procedures
```bash
# Local restore
DATABASE_URL=postgres://... ./scripts/restore-local.sh s3://bucket/pg/2025-01-12T02-00-00Z.dump

# Staging restore
# Same command with staging DATABASE_URL
```

**RPO**: < 24 hours (nightly backups)
**RTO**: < 1 hour (automated restore scripts)

## 🔍 Performance Observability

### Trace Middleware
```typescript
import { withTrace } from '@/lib/http/withTrace'

export async function POST(req: Request) {
  return withTrace(req, async ({ traceId, start }) => {
    // Your API logic here
    return NextResponse.json({ ok: true })
  })
}
```

### Logging Output
```json
{
  "traceId": "abc123",
  "path": "/api/match/top", 
  "ms": 245,
  "timestamp": "2025-01-12T10:30:00Z"
}
```

## 🚦 CI/CD Pipeline

### E2E Gates
- **Required for all PRs** to main branch
- **Database seeding** with test data
- **Smoke tests** before E2E execution
- **Artifact uploads** for failed test debugging

### Performance Gates  
- **Automated daily testing** on staging
- **Threshold enforcement** with k6
- **Slack alerts** on performance regressions
- **Manual trigger** for ad-hoc testing

### Migration Gates
- **Automatic smoke tests** for Prisma changes
- **Ephemeral database** testing
- **Rollback safety** verification

## 🔧 Configuration

### Environment Variables
```bash
# CI Environment (.env.ci)
NODE_ENV=test
DATABASE_URL=postgres://.../hyper_ci
FLAGS_DRY_RUN_AI=1
MP_TRACKING=0

# Performance Testing
BASE_URL=http://localhost:3001
PERF_BASE_URL=https://staging.example.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

### GitHub Secrets
```bash
# Performance Testing
PERF_BASE_URL=https://staging.example.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/...

# Database Backups  
DATABASE_URL=postgres://...
S3_BUCKET=my-backups
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
```

## 📋 Runbook

### Daily Operations
1. **Monitor performance tests** (03:00 UTC)
2. **Check backup success** (02:00 UTC)
3. **Review E2E test results** on PRs

### Incident Response
1. **Performance regression**: Check k6 thresholds, investigate recent changes
2. **E2E failures**: Review test artifacts, check test data consistency
3. **Backup failures**: Verify S3 permissions, check database connectivity

### Maintenance
1. **Test data cleanup**: Run `pnpm db:smoke` to verify health
2. **Performance baselines**: Update k6 thresholds based on production metrics
3. **Backup verification**: Test restore procedures quarterly

## 🎯 Success Metrics

- **E2E test reliability**: > 99% pass rate
- **Performance regression detection**: < 24 hours
- **Backup success rate**: > 99.9%
- **Migration safety**: 0 production incidents

## 🔮 Future Enhancements

- **Real-time performance dashboards** with Grafana
- **Automated performance regression detection** with ML
- **Cross-region backup replication** for disaster recovery
- **Performance budget annotations** in GitHub PRs

---

**EPIC 16 Status**: ✅ **COMPLETE** - Production-ready quality and scale foundation
