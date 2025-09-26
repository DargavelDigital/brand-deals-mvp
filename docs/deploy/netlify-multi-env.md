# Netlify Multi-Env via Branch Deploys

This document describes the multi-environment deployment strategy using Netlify branch deploys for safe promotion of changes through development, staging, production-candidate, and live production environments.

## Environment Overview

- **main** → Live production (protected)
- **prod** → Production-candidate (prod subdomain)
- **staging** → Staging QA
- **dev** → Developer integration

## Environment Variables

Set **once** at Site level in Netlify (All contexts). This ensures consistent configuration across all environments while allowing for environment-specific overrides if needed.

### Required Environment Variables
- `DATABASE_URL` - Database connection string
- `NEXTAUTH_SECRET` - NextAuth secret key
- `NEXTAUTH_URL` - NextAuth callback URL
- `FEATURE_IDEMPOTENCY_GATE` - Idempotency enforcement mode
- `CHROME_EXECUTABLE_PATH` - Chromium path for PDF generation

## Promotion Workflow

The promotion flow follows a strict dev → staging → prod → main sequence:

### 1. Dev → Staging
```bash
# Merge dev branch into staging
git checkout staging
git merge --no-ff dev
git push origin staging
```

### 2. Verify Staging Deploy
- Check deployment status in Netlify dashboard
- Verify build context: `/api/debug/build`
- Run preflight checks: `/api/debug/preflight`
- Test core functionality:
  - Brand Run happy path
  - Media Pack generation
  - Outreach workflow

### 3. Staging → Prod
```bash
# Merge staging branch into prod
git checkout prod
git merge --no-ff staging
git push origin prod
```

### 4. Verify Prod Deploy
- Check deployment status in Netlify dashboard
- Verify build context: `/api/debug/build`
- Run preflight checks: `/api/debug/preflight`
- Test core functionality:
  - Brand Run happy path
  - Media Pack generation
  - Outreach workflow

### 5. Prod → Main (Live)
```bash
# Merge prod branch into main (live production)
git checkout main
git merge --no-ff prod
git push origin main
```

## Verification Endpoints

### Build Information
- **Endpoint**: `/api/debug/build`
- **Purpose**: Verify which branch/context built the current deployment
- **Response**: `{ context, branch, commit, url, deployUrl, ts }`

### Preflight Checks
- **Endpoint**: `/api/debug/preflight`
- **Purpose**: Extended environment and system health checks
- **Response**: `{ context, branch, commit, nodeEnv, vercelEnv, ts }`

## Helper Scripts

Optional helper scripts are available in `package.json` for automated promotion:

```bash
# Promote dev → staging
npm run promote:staging

# Promote staging → prod
npm run promote:prod

# Promote prod → main (live)
npm run promote:main
```

**Note**: These scripts are optional helpers and won't run in CI unless explicitly called.

## Branch Protection

- **main**: Protected branch requiring pull request reviews
- **prod**: Protected branch requiring pull request reviews
- **staging**: Protected branch requiring pull request reviews
- **dev**: Open for direct pushes during development

## Rollback Strategy

If issues are discovered after promotion:

1. **Immediate**: Revert the merge commit on the affected branch
2. **Hotfix**: Create hotfix branch from previous stable commit
3. **Emergency**: Use Netlify's rollback feature in the dashboard

## Monitoring

- Monitor Netlify build logs for each environment
- Check application logs for errors
- Verify database connectivity and migrations
- Test critical user journeys at each stage

## Best Practices

1. **Never skip stages** - Always promote through dev → staging → prod → main
2. **Verify at each stage** - Run full test suite and manual verification
3. **Keep commits atomic** - Each merge should represent a complete, testable change
4. **Document changes** - Update changelog and documentation with each promotion
5. **Monitor performance** - Check build times and application performance metrics

## Troubleshooting

### Build Failures
- Check environment variables in Netlify dashboard
- Verify Node.js and PNPM versions
- Review build logs for specific error messages

### Database Issues
- Ensure `DATABASE_URL` is correctly set
- Check database connectivity and permissions
- Verify migration status

### Feature Flag Issues
- Verify `FEATURE_IDEMPOTENCY_GATE` setting
- Check other feature flags in environment variables
- Review application logs for flag-related errors
