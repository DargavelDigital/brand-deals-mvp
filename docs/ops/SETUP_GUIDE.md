# Branch Protection Setup Guide

This guide will walk you through setting up GitHub branch protection for the `main` branch to ensure code quality and prevent accidental changes.

## Prerequisites

### 1. Install GitHub CLI

**macOS:**
```bash
brew install gh
```

**Ubuntu/Debian:**
```bash
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

**Windows:**
```bash
winget install GitHub.cli
```

### 2. Authenticate with GitHub

```bash
gh auth login
```

Follow the prompts to authenticate with your GitHub account.

## Setup Steps

### 1. Verify Repository Access

```bash
# Check if you can access the repository
gh repo view

# Should show repository information
```

### 2. Set Up Branch Protection

```bash
# Run the setup script
npm run setup:branch-protection
```

This will configure:
- ✅ Require 1+ review before merging to main
- ✅ Require `audit-and-test` check to pass
- ✅ Disallow force pushes
- ✅ Disallow branch deletion
- ✅ Require up-to-date branch before merge
- ✅ Require conversation resolution

### 3. Verify the Setup

```bash
# Verify branch protection is working
npm run verify:protection
```

This will check:
- ✅ Branch protection rules are configured
- ✅ Required checks are set up
- ✅ All required checks pass locally

### 4. Test the Promotion Workflow

```bash
# Test that all required checks pass
npm run check:main-ready

# This runs:
# - npm run audit:all
# - npm run test:idempotency  
# - npm run build:netlify
```

## What's Protected

### Branch Protection Rules

The `main` branch now has the following protection:

1. **Required Reviews**: 1+ approval required before merging
2. **Required Checks**: `audit-and-test` workflow must pass
3. **Force Push Protection**: Disallows force pushes to main
4. **Up-to-date Requirement**: Branch must be up-to-date before merging
5. **Conversation Resolution**: All conversations must be resolved
6. **Branch Deletion Protection**: Prevents accidental deletion

### Required Checks

All changes to `main` must pass these checks:

1. **`npm run audit:all`** - Runs all audit scripts for code quality
2. **`npm run test:idempotency`** - Ensures data consistency and duplicate prevention
3. **`npm run build:netlify`** - Verifies production build works correctly

### GitHub Actions Workflow

The `.github/workflows/branch-protection.yml` workflow:
- Runs on pull requests to `main`, `prod`, `staging`, `dev`
- Runs on pushes to `main`, `prod`, `staging`, `dev`
- Executes all required checks
- Caches dependencies for faster builds
- Uploads build artifacts

## Promotion Workflow

### Safe Promotion to Main

```bash
# 1. Ensure all checks pass locally
npm run check:main-ready

# 2. Promote through environments
npm run promote:staging  # dev → staging
npm run promote:prod     # staging → prod
npm run promote:main     # prod → main
```

### Manual Promotion (if needed)

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

## Troubleshooting

### Common Issues

1. **"GitHub CLI not installed"**:
   - Install GitHub CLI using the instructions above
   - Run `gh auth login` to authenticate

2. **"Not authenticated with GitHub"**:
   - Run `gh auth login`
   - Follow the authentication prompts

3. **"No branch protection rules found"**:
   - Run `npm run setup:branch-protection`
   - Check that you have admin access to the repository

4. **"Required checks fail locally"**:
   - Ensure you're using the same Node.js version (20)
   - Clear caches: `rm -rf node_modules .next pnpm-lock.yaml && pnpm install`
   - Run `npm run check:main-ready` to test locally

5. **"Branch protection prevents merge"**:
   - Ensure all required checks are passing
   - Ensure you have required approvals
   - Ensure branch is up-to-date with main

### Verification Commands

```bash
# Check branch protection status
gh api repos/OWNER/REPO/branches/main/protection

# Check if checks are passing
gh pr checks

# View repository information
gh repo view
```

## Security Features

### Multi-layer Protection

1. **Branch Protection**: GitHub-level protection rules
2. **CI Checks**: Automated testing and validation
3. **Local Verification**: Pre-commit and pre-push checks
4. **Review Process**: Human oversight and approval

### Audit Trail

- All changes are tracked and reviewable
- No direct commits to main (only via pull requests)
- All merges require approval and passing checks
- Complete history of who changed what and when

## Best Practices

1. **Small PRs**: Keep pull requests focused and reviewable
2. **Clear Descriptions**: Explain what and why you're changing
3. **Test Coverage**: Ensure adequate testing for changes
4. **Documentation**: Update docs for significant changes
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

### Override Protection (Emergency Only)

Repository admins can temporarily disable protection:

1. Go to repository Settings → Branches
2. Click on `main` branch protection rule
3. Temporarily disable protection
4. Make necessary changes
5. Re-enable protection immediately

## Next Steps

After completing this setup:

1. ✅ Branch protection is active
2. ✅ All required checks are configured
3. ✅ Promotion workflow is ready
4. ✅ Documentation is complete

The `main` branch is now **fully protected** and ready for production use! 🎉

## Support

If you encounter issues:

1. Check this guide first
2. Run `npm run verify:protection` to diagnose issues
3. Check GitHub Actions logs for CI failures
4. Review the troubleshooting section above

For additional help, refer to:
- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [GitHub CLI Documentation](https://cli.github.com/)
