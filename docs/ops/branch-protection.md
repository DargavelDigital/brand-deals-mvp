# Branch Protection (GitHub)

This document outlines the branch protection strategy to ensure code quality and prevent accidental changes to critical branches.

## Protected Branches

### main (Production)
- **Status**: Protected
- **Purpose**: Live production environment
- **Protection Level**: Maximum

### prod (Production Candidate)
- **Status**: Protected (optional)
- **Purpose**: Production-candidate environment
- **Protection Level**: High

### staging (Staging)
- **Status**: Protected (optional)
- **Purpose**: Staging QA environment
- **Protection Level**: Medium

### dev (Development)
- **Status**: Open
- **Purpose**: Developer integration
- **Protection Level**: Minimal

## Branch Protection Rules

### Required Settings

#### 1. Require Pull Request Reviews
- **Minimum reviewers**: 1
- **Dismiss stale reviews**: Yes
- **Require review from code owners**: Yes (if CODEOWNERS file exists)

#### 2. Require Status Checks to Pass
- **audit pack**: `pnpm audit:all`
- **idempotency tests**: `pnpm test:idempotency`
- **build verification**: `pnpm run build:netlify`

#### 3. Branch Protection Rules
- **Disallow force pushes**: Yes
- **Require branch to be up to date before merging**: Yes
- **Require linear history**: Yes (optional)
- **Restrict pushes that create files**: No

#### 4. Additional Protections
- **Require conversation resolution before merging**: Yes
- **Require signed commits**: No (optional)
- **Require deployments to succeed before merging**: No

## Implementation Steps

### 1. Enable Branch Protection
1. Go to repository Settings → Branches
2. Click "Add rule" or "Add branch protection rule"
3. Set branch name pattern: `main` (and optionally `prod`, `staging`)
4. Configure the settings as outlined above
5. Click "Create" or "Save changes"

### 2. Configure Required Status Checks
1. In the branch protection rule, scroll to "Require status checks to pass"
2. Check "Require branches to be up to date before merging"
3. Add the following required status checks:
   - `audit-pack` (from CI workflow)
   - `idempotency-tests` (from CI workflow)
   - `build-verification` (from CI workflow)

### 3. Set Up Code Owners (Optional)
Create `.github/CODEOWNERS` file:
```
# Global owners
* @your-username

# Critical files
/docs/ @your-username
/src/lib/ @your-username
/scripts/ @your-username
```

## CI Integration

The CI workflow (`.github/workflows/ci.yml`) automatically runs the required checks:

- **Audit Pack**: Comprehensive security and code quality audit
- **Idempotency Tests**: Verify duplicate protection and transaction coverage
- **Build Verification**: Ensure the application builds successfully

## Emergency Procedures

### Bypassing Protection (Emergency Only)
1. **Temporary disable**: Go to branch protection settings and temporarily disable rules
2. **Force push**: Use `git push --force-with-lease` (not recommended)
3. **Direct push**: Push directly to protected branch (requires admin override)

### Hotfix Process
1. Create hotfix branch from `main`
2. Make minimal, focused changes
3. Create PR with detailed explanation
4. Request expedited review
5. Merge after approval

## Monitoring

### Branch Protection Status
- Monitor branch protection status in GitHub repository settings
- Check CI workflow runs for any failures
- Review audit reports for new issues

### Compliance Checks
- Regular review of branch protection rules
- Verification that all required checks are running
- Confirmation that no direct pushes are occurring

## Best Practices

### For Developers
1. **Always use feature branches** - Never work directly on protected branches
2. **Keep PRs small and focused** - Easier to review and less likely to introduce issues
3. **Write descriptive commit messages** - Help reviewers understand changes
4. **Respond to review feedback** - Address comments promptly and thoroughly

### For Reviewers
1. **Review thoroughly** - Check code quality, security, and functionality
2. **Test locally if needed** - For complex changes, verify locally
3. **Request changes when necessary** - Don't approve substandard code
4. **Provide constructive feedback** - Help developers improve

### For Maintainers
1. **Monitor CI status** - Ensure all checks are passing
2. **Review audit reports** - Address any new issues promptly
3. **Update protection rules** - Adjust as needed based on team needs
4. **Document changes** - Keep this document updated

## Troubleshooting

### Common Issues

#### CI Checks Failing
- Check the CI workflow logs for specific error messages
- Run the failing command locally to reproduce
- Fix the issue and push a new commit

#### Branch Protection Bypass
- Verify the user has the necessary permissions
- Check if the branch protection rule is correctly configured
- Ensure the user is not an administrator with override rights

#### Merge Conflicts
- Update the feature branch with the latest changes from the target branch
- Resolve conflicts locally
- Push the updated branch

### Getting Help
- Check GitHub's branch protection documentation
- Review the CI workflow configuration
- Contact repository administrators for assistance

## Security Considerations

### Access Control
- Limit who can push to protected branches
- Use team-based access control where possible
- Regularly review and audit access permissions

### Audit Trail
- All changes to protected branches are logged
- PR reviews provide an audit trail
- CI runs provide evidence of code quality checks

### Compliance
- Branch protection helps meet security compliance requirements
- Provides evidence of code review processes
- Ensures all changes go through proper approval workflows
