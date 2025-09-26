# Branch Protection Deployment Checklist

## Pre-Deployment Checklist

### ✅ Prerequisites
- [ ] GitHub CLI installed (`brew install gh`)
- [ ] GitHub CLI authenticated (`gh auth login`)
- [ ] Repository admin access confirmed
- [ ] All team members notified of new protection rules

### ✅ Validation
- [ ] Run `npm run validate:protection` - should show 86%+ success rate
- [ ] Run `npm run verify:protection` - should show protection rules configured
- [ ] Test required checks locally: `npm run check:main-ready`

### ✅ Documentation Review
- [ ] Review `docs/ops/SETUP_GUIDE.md` for completeness
- [ ] Review `docs/ops/QUICK_REFERENCE.md` for accuracy
- [ ] Review `docs/ops/BRANCH_PROTECTION_SUMMARY.md` for completeness
- [ ] Update team on new workflow processes

## Deployment Steps

### 1. Set Up Branch Protection
```bash
# Install GitHub CLI (if not already installed)
brew install gh

# Authenticate with GitHub
gh auth login

# Set up branch protection rules
npm run setup:branch-protection

# Verify the setup
npm run verify:protection
```

### 2. Test the System
```bash
# Test all required checks
npm run check:main-ready

# Test promotion workflow (if applicable)
npm run promote:staging  # dev → staging
npm run promote:prod     # staging → prod
# Note: Don't run promote:main until ready
```

### 3. Verify Protection Rules
```bash
# Check that protection rules are active
gh api repos/OWNER/REPO/branches/main/protection

# Should show:
# - required_status_checks: ["audit-and-test"]
# - required_pull_request_reviews: 1
# - allow_force_pushes: false
# - allow_deletions: false
```

## Post-Deployment Verification

### ✅ Immediate Verification
- [ ] Create a test pull request to main
- [ ] Verify that checks are required before merge
- [ ] Verify that review is required before merge
- [ ] Verify that force push is blocked
- [ ] Test that up-to-date branch is required

### ✅ Team Training
- [ ] Share `docs/ops/QUICK_REFERENCE.md` with team
- [ ] Conduct team training on new workflow
- [ ] Document any custom processes or exceptions
- [ ] Set up monitoring for failed checks

### ✅ Monitoring Setup
- [ ] Monitor GitHub Actions for failed builds
- [ ] Set up alerts for protection rule violations
- [ ] Track review times and bottlenecks
- [ ] Monitor promotion workflow success rates

## Emergency Procedures

### If Main Branch is Broken
1. **Immediate Response**:
   - Revert the problematic commit
   - Notify the team immediately
   - Document the incident

2. **Investigation**:
   - Review CI logs for root cause
   - Check if tests were missing
   - Identify process improvements

3. **Prevention**:
   - Update tests to catch the issue
   - Improve CI checks if needed
   - Review and update processes

### Override Protection (Emergency Only)
1. Go to repository Settings → Branches
2. Click on `main` branch protection rule
3. Temporarily disable protection
4. Make necessary changes
5. Re-enable protection immediately
6. Document the incident

## Success Metrics

### Protection Coverage
- [ ] 100% of main branch changes go through pull requests
- [ ] 100% of changes are reviewed before merge
- [ ] 100% of changes pass all required checks
- [ ] 0 force pushes to main branch
- [ ] 0 direct commits to main branch

### Quality Metrics
- [ ] All audit checks pass before merge
- [ ] All tests pass before merge
- [ ] All builds succeed before merge
- [ ] All conversations resolved before merge

### Process Metrics
- [ ] Average review time < 24 hours
- [ ] Average time to merge < 48 hours
- [ ] Failed check rate < 5%
- [ ] Team satisfaction with new process

## Rollback Plan

If the branch protection system causes issues:

1. **Temporary Disable**:
   - Go to repository Settings → Branches
   - Disable protection rules temporarily
   - Notify team of temporary change

2. **Investigate Issues**:
   - Review failed checks and their causes
   - Identify configuration problems
   - Fix issues in development

3. **Re-enable Protection**:
   - Fix identified issues
   - Re-enable protection rules
   - Monitor for continued issues

## Long-term Maintenance

### Monthly Reviews
- [ ] Review failed check patterns
- [ ] Update protection rules if needed
- [ ] Review team feedback and process improvements
- [ ] Update documentation as needed

### Quarterly Reviews
- [ ] Review overall system effectiveness
- [ ] Update required checks if needed
- [ ] Review team training needs
- [ ] Plan system improvements

## Support and Troubleshooting

### Common Issues
1. **Checks fail locally but pass in CI**:
   - Use same Node.js and pnpm versions
   - Clear caches: `rm -rf node_modules .next pnpm-lock.yaml && pnpm install`

2. **Branch protection prevents merge**:
   - Ensure all required checks are passing
   - Ensure you have required approvals
   - Ensure branch is up-to-date

3. **Force push blocked**:
   - Use `git rebase` instead of force push
   - Create new branch if history needs rewriting

### Getting Help
- **Setup Issues**: Check `docs/ops/SETUP_GUIDE.md`
- **Troubleshooting**: Run `npm run verify:protection`
- **CI Failures**: Check GitHub Actions logs
- **Emergency**: Use admin override (document incident)

## Final Sign-off

### Deployment Approval
- [ ] All prerequisites met
- [ ] All validations passed
- [ ] Team training completed
- [ ] Emergency procedures documented
- [ ] Monitoring setup complete

**Deployment Approved By**: _________________  
**Date**: _________________  
**Time**: _________________

---

**Remember**: The `main` branch is now fully protected! 🛡️
