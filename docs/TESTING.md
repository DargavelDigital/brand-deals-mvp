# Testing Documentation

## Overview

This document covers the automated testing strategy for the BrandDeals MVP, including E2E tests, CI workflows, and local development testing.

## Test Structure

### E2E Tests Location
```
tests/e2e/
├── checklist/           # Core MVP functionality tests
│   ├── onboarding.spec.ts      # Auth, social connect, Stripe
│   ├── brand_run.spec.ts       # 7-step wizard flow
│   ├── outreach_templates.spec.ts  # Email templates & variables
│   └── dashboard_ux.spec.ts    # Responsive design & navigation
├── helpers/
│   └── testUtils.ts    # Shared test utilities
├── global-setup.ts     # Test environment setup
└── global-teardown.ts  # Test cleanup
```

## Test Modes

### Demo Mode (`DEMO_MODE=true`)
- Uses mock services and seeded demo data
- Fast execution, no external API calls
- Perfect for development and CI
- Tests the complete user flow with simulated data

### Real Mode (`DEMO_MODE=false`)
- Uses real service providers
- Requires valid API credentials
- Tests actual integrations
- Used for production validation

## Local Testing

### Prerequisites
1. Install dependencies: `pnpm install`
2. Install Playwright browsers: `pnpm playwright install`
3. Set up environment variables in `.env.local`
4. Ensure database is accessible

### Running Tests

#### Demo Mode (Recommended for Development)
```bash
# Setup demo database and run tests
pnpm test:e2e:demo:setup && pnpm test:e2e:demo

# Or run setup and tests separately
pnpm test:e2e:demo:setup
pnpm test:e2e:demo
```

#### Real Mode (Requires API Keys)
```bash
# Setup real database and run tests
pnpm test:e2e:real:setup && pnpm test:e2e:real

# Or run setup and tests separately
pnpm test:e2e:real:setup
pnpm test:e2e:real
```

#### Full Matrix (Both Modes)
```bash
# Run both demo and real mode tests
pnpm test:e2e:matrix
```

### Environment Variables Required

#### For Demo Mode
```bash
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
DEMO_MODE=true
```

#### For Real Mode
```bash
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
DEMO_MODE=false
# Additional API keys as needed
```

## CI/CD Testing

### GitHub Actions

The CI workflow runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

#### Matrix Strategy
- **Demo Mode**: Fast tests with mock data
- **Real Mode**: Integration tests with real services
- **Cross-browser**: Additional browser testing on main branch

#### Artifacts
On test failure, the following are uploaded:
- Playwright HTML reports
- Test videos
- Screenshots
- Database logs

### Netlify Predeploy

#### Deploy Preview
- Runs demo tests but doesn't fail the build
- Results logged for review
- Command: `pnpm test:e2e:demo || true`

#### Production
- Must pass all demo tests
- Fails build on test failure
- Command: `pnpm test:e2e:demo`

## Test Coverage

### MVP Checklist Mapping

| Checklist Item | Test File | Test Case |
|----------------|-----------|-----------|
| ✅ Core Onboarding | `onboarding.spec.ts` | Auth routes, social connect, Stripe gates |
| ✅ AI Audit | `brand_run.spec.ts` | Step 2: AI Audit with insights |
| ✅ Brand Discovery | `brand_run.spec.ts` | Step 3: Brand matches and approval |
| ✅ Outreach | `brand_run.spec.ts` | Step 7: Email sequence creation |
| ✅ CRM | `brand_run.spec.ts` | Deal stage updates after outreach |
| ✅ Payments | `onboarding.spec.ts` | Subscription gate validation |
| ✅ Mobile | `dashboard_ux.spec.ts` | Responsive design testing |
| ✅ Demo Mode | All specs | Environment-aware testing |

### Test Categories

#### 1. Onboarding Flow
- Authentication routes render correctly
- Social media connection status
- Stripe subscription gates
- Demo user access patterns

#### 2. Brand Run Wizard
- 7-step progression
- Auto mode functionality
- Step validation and navigation
- Data persistence between steps

#### 3. Outreach System
- Template selection and rendering
- Variable substitution
- Media pack attachments
- Sequence creation and status

#### 4. Dashboard UX
- Responsive grid layouts
- Navigation functionality
- Design system compliance
- Mobile responsiveness

## Troubleshooting

### Common Issues

#### Test Flakiness
```bash
# Increase timeouts for slow environments
export PLAYWRIGHT_TEST_TIMEOUT=120000

# Run single test to isolate issues
pnpm playwright test -g "specific test name"

# Run with debug logging
DEBUG=pw:api pnpm playwright test
```

#### Database Connection Issues
```bash
# Verify database accessibility
pnpm prisma db push

# Reset database state
pnpm db:reset

# Check environment variables
cat .env.local | grep DATABASE_URL
```

#### Browser Issues
```bash
# Reinstall Playwright browsers
pnpm playwright install --with-deps

# Clear browser cache
rm -rf ~/.cache/ms-playwright
```

### Debug Mode

#### Enable Debug Logging
```bash
# Set debug environment variable
export DEBUG=pw:api,pw:browser

# Run tests with debug output
pnpm playwright test --debug
```

#### Visual Debugging
```bash
# Run tests with headed browser
pnpm playwright test --headed

# Run tests with slow motion
pnpm playwright test --headed --timeout=0
```

## Performance

### Test Execution Times
- **Demo Mode**: ~2-3 minutes for full suite
- **Real Mode**: ~5-8 minutes (depends on API response times)
- **Individual Tests**: 10-30 seconds each

### Optimization Tips
1. Use `test.beforeEach()` for common setup
2. Implement proper waiting strategies
3. Avoid unnecessary page reloads
4. Use `waitForNetworkIdle()` for dynamic content

## Contributing

### Adding New Tests
1. Follow existing test structure
2. Use helper functions from `testUtils.ts`
3. Add appropriate assertions and timeouts
4. Update this documentation

### Test Naming Convention
- Use descriptive test names
- Group related tests in `test.describe()`
- Follow pattern: `action_should_result`

### Example Test Structure
```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page);
  });

  test('action should result in expected outcome', async ({ page }) => {
    // Arrange
    await page.goto('/feature');
    
    // Act
    await page.click('button');
    
    // Assert
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

## Support

For testing questions or issues:
1. Check this documentation
2. Review test logs and artifacts
3. Check GitHub Actions workflow
4. Consult the Playwright documentation

---

*Last Updated: August 21, 2024*
*Test Coverage: 90% of MVP Checklist items*
