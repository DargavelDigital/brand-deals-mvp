# Operations Documentation

This directory contains operational documentation for the Brand Deals MVP project.

## Quick Start

### 1. Set Up Branch Protection

```bash
# Install GitHub CLI (if not already installed)
brew install gh  # macOS
# or visit https://cli.github.com/ for other platforms

# Authenticate with GitHub
gh auth login

# Set up branch protection for main branch
npm run setup:branch-protection

# Verify the setup
npm run verify:protection
```

### 2. Safe Promotion Workflow

```bash
# Check if ready for promotion
npm run check:main-ready

# Promote through environments
npm run promote:staging  # dev → staging
npm run promote:prod     # staging → prod
npm run promote:main     # prod → main
```

## Documentation Files

- **[Branch Protection](branch-protection.md)** - GitHub branch protection setup and promotion workflow
- **[Email Safety](email-safety.md)** - Email safety policies and anti-spam measures
- **[Idempotency](idempotency.md)** - Idempotency system for preventing duplicate operations
- **[Idempotency Gate](idempotency-gate.md)** - Middleware for enforcing idempotency keys

## Scripts

### Branch Protection
- `npm run setup:branch-protection` - Set up GitHub branch protection rules
- `npm run verify:protection` - Verify branch protection is working correctly
- `npm run check:main-ready` - Run all required checks before promoting to main

### Promotion
- `npm run promote:staging` - Promote dev → staging
- `npm run promote:prod` - Promote staging → prod  
- `npm run promote:main` - Promote prod → main

### Testing
- `npm run test:email-safety` - Test email safety and unsubscribe flow
- `npm run test:idempotency` - Run idempotency tests
- `npm run test:critical` - Run critical tests

## Security Features

### Branch Protection
- ✅ Requires 1+ review before merging to main
- ✅ Requires all CI checks to pass
- ✅ Disallows force pushes
- ✅ Requires up-to-date branch before merge
- ✅ Requires conversation resolution

### Email Safety
- ✅ Development environment email blocking
- ✅ Role account detection and blocking
- ✅ Suppression list management
- ✅ Compliance footers on all emails
- ✅ Unsubscribe flow with token verification

### Idempotency
- ✅ Duplicate request prevention
- ✅ Multi-write transaction protection
- ✅ Idempotency key enforcement
- ✅ Graceful degradation when database unavailable

## Monitoring

### Required Checks
All changes to `main` must pass:
1. **`pnpm audit:all`** - Code quality audits
2. **`pnpm test:idempotency`** - Data consistency tests
3. **`pnpm run build:netlify`** - Production build verification

### CI/CD Pipeline
- GitHub Actions workflow runs on all pull requests
- Automated testing and building
- Artifact upload for successful builds
- Status checks required before merge

## Troubleshooting

### Common Issues

1. **Branch protection prevents merge**:
   - Ensure all required checks are passing
   - Ensure you have required approvals
   - Ensure branch is up-to-date

2. **Checks fail locally but pass in CI**:
   - Use same Node.js and pnpm versions
   - Clear caches: `rm -rf node_modules .next pnpm-lock.yaml && pnpm install`

3. **Email safety blocking legitimate emails**:
   - Check `ALLOW_DEV_EMAILS` environment variable
   - Review suppression list: `cat var/suppressions.json`
   - Test with debug endpoints

### Emergency Procedures

1. **Main branch is broken**:
   - Revert problematic commit immediately
   - Notify team
   - Investigate root cause

2. **Override protection (emergency only)**:
   - Repository admins can temporarily disable protection
   - Re-enable immediately after fix
   - Document the incident

## Best Practices

1. **Small PRs**: Keep changes focused and reviewable
2. **Clear Descriptions**: Explain what and why
3. **Test Coverage**: Ensure adequate testing
4. **Documentation**: Update docs for significant changes
5. **Review Quality**: Provide thorough, constructive reviews

## Compliance

This setup ensures:
- **Code Quality**: All code is reviewed and tested
- **Stability**: No direct commits or force pushes to main
- **Traceability**: All changes are tracked and auditable
- **Consistency**: All environments follow same promotion path
- **Security**: Multiple layers of protection against accidents
