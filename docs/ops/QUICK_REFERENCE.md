# Branch Protection Quick Reference

## 🚀 Quick Setup

```bash
# 1. Install GitHub CLI
brew install gh  # macOS

# 2. Authenticate
gh auth login

# 3. Set up protection
npm run setup:branch-protection

# 4. Verify setup
npm run verify:protection
```

## ✅ Required Checks

All changes to `main` must pass:

```bash
npm run audit:all        # Code quality audits
npm run test:idempotency # Data consistency tests  
npm run build:netlify    # Production build test
```

## 🔄 Promotion Workflow

```bash
# Test locally first
npm run check:main-ready

# Promote through environments
npm run promote:staging  # dev → staging
npm run promote:prod     # staging → prod
npm run promote:main     # prod → main
```

## 🛡️ Protection Rules

- ✅ **1+ Review Required**: All PRs need approval
- ✅ **CI Checks Must Pass**: `audit-and-test` workflow
- ✅ **No Force Pushes**: Prevents history rewriting
- ✅ **Up-to-date Required**: Branch must be current
- ✅ **Conversation Resolution**: All discussions resolved

## 🔧 Troubleshooting

```bash
# Check protection status
npm run verify:protection

# Test checks locally
npm run check:main-ready

# View GitHub status
gh pr checks
```

## 🚨 Emergency Override

**Only for repository admins:**

1. Go to Settings → Branches
2. Click `main` protection rule
3. Temporarily disable
4. Make changes
5. Re-enable immediately

## 📋 Branch Strategy

```
dev → staging → prod → main
```

- **dev**: Active development
- **staging**: Pre-production testing
- **prod**: Production-ready code
- **main**: Protected production branch

## 🎯 Key Commands

| Command | Purpose |
|---------|---------|
| `npm run setup:branch-protection` | Set up GitHub protection |
| `npm run verify:protection` | Check protection status |
| `npm run check:main-ready` | Test all required checks |
| `npm run promote:main` | Safe promotion to main |
| `gh pr checks` | View PR check status |

## 🔍 Verification Checklist

- [ ] GitHub CLI installed and authenticated
- [ ] Branch protection rules configured
- [ ] Required checks passing locally
- [ ] Promotion workflow tested
- [ ] Documentation reviewed

## 📞 Support

- **Setup Issues**: Check `docs/ops/SETUP_GUIDE.md`
- **Troubleshooting**: Run `npm run verify:protection`
- **CI Failures**: Check GitHub Actions logs
- **Emergency**: Use admin override (document incident)

---

**Remember**: The `main` branch is now fully protected! 🛡️
