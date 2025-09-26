# GitHub Branch Protection Setup

This document outlines the branch protection rules and promotion workflow for the `main` branch to ensure code quality and prevent accidental changes.

## Overview

The `main` branch is protected with the following rules:
- **Required Reviews**: 1+ approval required before merging
- **Required Checks**: All CI checks must pass
- **Force Push Protection**: Disallows force pushes
- **Up-to-date Requirement**: Branch must be up-to-date before merging
- **Conversation Resolution**: All conversations must be resolved

## Required Checks

The following checks must pass before merging to `main`:

1. **`pnpm audit:all`** - Runs all audit scripts to ensure code quality
2. **`pnpm test:idempotency`** - Runs idempotency tests to ensure data consistency
3. **`pnpm run build:netlify`** - Ensures the code builds successfully for production

## Setup Instructions

### 1. Install GitHub CLI

```bash
# macOS
brew install gh

# Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# Windows
winget install GitHub.cli
```

### 2. Authenticate with GitHub

```bash
gh auth login
```

### 3. Set Up Branch Protection

```bash
npm run setup:branch-protection
```

This will configure the following protection rules:
- Require 1+ review
- Require `audit-and-test` check to pass
- Disallow force pushes
- Disallow branch deletion
- Require up-to-date branch before merge
- Require conversation resolution

## Promotion Workflow

### Safe Promotion to Main

```bash
# 1. Ensure all checks pass locally
pnpm check:main-ready

# 2. Promote through environments
pnpm promote:staging  # dev → staging
pnpm promote:prod     # staging → prod
pnpm promote:main     # prod → main
```

### Manual Promotion Steps

If you need to promote manually:

```bash
# 1. Switch to main branch
git checkout main

# 2. Pull latest changes
git pull origin main

# 3. Merge from prod
git merge --no-ff prod

# 4. Push to main
git push origin main
```

## Branch Strategy

```
dev → staging → prod → main
```

- **`dev`**: Development branch for active work
- **`staging`**: Pre-production testing
- **`prod`**: Production-ready code
- **`main`**: Protected production branch

## CI/CD Pipeline

### GitHub Actions Workflow

The `.github/workflows/branch-protection.yml` workflow runs on:
- Pull requests to `main`, `prod`, `staging`, `dev`
- Pushes to `main`, `prod`, `staging`, `dev`

### Workflow Steps

1. **Checkout code**
2. **Setup Node.js 20**
3. **Setup pnpm 10.14.0**
4. **Cache dependencies**
5. **Install dependencies**
6. **Run audit checks** (`pnpm audit:all`)
7. **Run idempotency tests** (`pnpm test:idempotency`)
8. **Build for Netlify** (`pnpm run build:netlify`)
9. **Upload build artifacts**

## Troubleshooting

### Common Issues

1. **Check fails locally but passes in CI**:
   - Ensure you're using the same Node.js and pnpm versions
   - Clear local caches: `rm -rf node_modules .next pnpm-lock.yaml && pnpm install`

2. **Branch protection prevents merge**:
   - Ensure all required checks are passing
   - Ensure you have the required number of approvals
   - Ensure the branch is up-to-date with main

3. **Force push blocked**:
   - Use `git rebase` instead of force push
   - Create a new branch if you need to rewrite history

### Override Protection (Emergency Only)

In extreme emergencies, repository admins can temporarily disable branch protection:

1. Go to repository Settings → Branches
2. Click on `main` branch protection rule
3. Temporarily disable protection
4. Make necessary changes
5. Re-enable protection immediately

## Monitoring

### Check Protection Status

```bash
# View current protection rules
gh api repos/OWNER/REPO/branches/main/protection

# Check if checks are passing
gh pr checks
```

### Audit Logs

Monitor the following for compliance:
- Pull request reviews
- CI check results
- Merge patterns
- Force push attempts (should be zero)

## Security Considerations

1. **Review Requirements**: Never merge without proper review
2. **Check Requirements**: All checks must pass before merge
3. **Admin Override**: Only use in genuine emergencies
4. **Audit Trail**: All changes are logged and traceable

## Best Practices

1. **Small PRs**: Keep pull requests small and focused
2. **Clear Descriptions**: Provide clear descriptions of changes
3. **Test Coverage**: Ensure adequate test coverage
4. **Documentation**: Update documentation for significant changes
5. **Review Quality**: Provide thorough, constructive reviews

## Emergency Procedures

### If Main Branch is Broken

1. **Immediate Response**:
   - Revert the problematic commit
   - Notify the team
   - Investigate the root cause

2. **Investigation**:
   - Review CI logs
   - Check for missing tests
   - Identify process improvements

3. **Prevention**:
   - Update tests to catch the issue
   - Improve CI checks if needed
   - Review and update processes

### Rollback Procedure

```bash
# 1. Identify the last good commit
git log --oneline

# 2. Revert to last good commit
git revert <commit-hash>

# 3. Push the revert
git push origin main

# 4. Notify team and investigate
```

## Compliance

This branch protection setup ensures:
- **Code Quality**: All code is reviewed and tested
- **Stability**: No force pushes or direct commits to main
- **Traceability**: All changes are tracked and auditable
- **Consistency**: All environments follow the same promotion path