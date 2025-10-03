# Vercel Migration Plan

## Goal
Migrate the brand-deals-mvp application from Netlify to Vercel while retaining all Netlify-specific code behind a feature toggle for quick rollback capability.

## Overview
This migration will:
- Set up Vercel deployment configuration
- Implement feature toggles to switch between Netlify and Vercel environments
- Maintain all existing Netlify functionality as a fallback
- Ensure zero-downtime deployment with easy rollback

## Rollback Strategy

### Quick Rollback (Recommended)
```bash
# Option 1: Revert the merge commit
git checkout main
git revert -m 1 <merge_commit_hash>

# Option 2: Reset to Netlify baseline
git reset --hard netlify-baseline
```

### Post-Rollback Steps
1. Redeploy to Netlify (automatic via GitHub integration)
2. Switch DNS back to Netlify
3. Verify all functionality works on Netlify
4. Monitor for any issues

## Migration Checklist

### Phase 1: Preparation
- [x] Create netlify-baseline tag
- [x] Create feature/vercel-migration branch
- [x] Document migration plan
- [ ] Set up Vercel project
- [ ] Configure Vercel environment variables
- [ ] Test Vercel build process

### Phase 2: Feature Toggle Implementation
- [ ] Create environment variable for deployment platform (NETLIFY vs VERCEL)
- [ ] Update build scripts to handle both platforms
- [ ] Modify API routes for platform-specific behavior
- [ ] Update middleware for platform detection
- [ ] Add platform-specific configuration files

### Phase 3: Vercel Configuration
- [ ] Create vercel.json configuration
- [ ] Set up Vercel functions (if needed)
- [ ] Configure Vercel environment variables
- [ ] Set up Vercel domains
- [ ] Configure Vercel analytics (if desired)

### Phase 4: Code Updates
- [ ] Update deployment scripts
- [ ] Modify environment variable handling
- [ ] Update API endpoints for Vercel compatibility
- [ ] Ensure Prisma works with Vercel
- [ ] Update static file handling
- [ ] Test PDF generation on Vercel

### Phase 5: Testing
- [ ] Test build process on Vercel
- [ ] Verify all API endpoints work
- [ ] Test database connections
- [ ] Verify file uploads/downloads
- [ ] Test authentication flow
- [ ] Run full test suite
- [ ] Performance testing

### Phase 6: Deployment
- [ ] Deploy to Vercel staging
- [ ] Run smoke tests
- [ ] Deploy to Vercel production
- [ ] Update DNS to point to Vercel
- [ ] Monitor for issues
- [ ] Keep Netlify as backup for 48 hours

### Phase 7: Cleanup
- [ ] Remove Netlify-specific code (after 48 hours)
- [ ] Update documentation
- [ ] Clean up feature toggles
- [ ] Archive Netlify configuration

## Risk Mitigation
- All Netlify code remains functional behind feature toggle
- DNS can be quickly switched back
- Database remains unchanged
- Rollback can be executed in minutes
- Full test coverage before switching

## Success Criteria
- [ ] Application fully functional on Vercel
- [ ] All existing features work identically
- [ ] Performance is equal or better than Netlify
- [ ] Rollback can be executed in < 5 minutes
- [ ] Zero data loss or corruption
