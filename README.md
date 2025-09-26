# Brand Deals MVP

A premium SaaS platform for brand-influencer partnerships with AI-powered matching and workflow automation.

## 🛡️ Branch Protection

This repository uses GitHub branch protection to ensure code quality and prevent accidental changes to the `main` branch.

### Quick Setup

```bash
# 1. Install GitHub CLI
brew install gh  # macOS

# 2. Authenticate with GitHub
gh auth login

# 3. Set up branch protection
npm run setup:branch-protection

# 4. Verify setup
npm run verify:protection
```

### Protection Rules

- ✅ **1+ Review Required**: All PRs need approval before merging
- ✅ **CI Checks Must Pass**: `audit-and-test` workflow must succeed
- ✅ **No Force Pushes**: Prevents history rewriting
- ✅ **Up-to-date Required**: Branch must be current before merge
- ✅ **Conversation Resolution**: All discussions must be resolved

### Required Checks

All changes to `main` must pass:

```bash
npm run audit:all        # Code quality audits
npm run test:idempotency # Data consistency tests
npm run build:netlify    # Production build verification
```

### Promotion Workflow

```bash
# Test locally first
npm run check:main-ready

# Promote through environments
npm run promote:staging  # dev → staging
npm run promote:prod     # staging → prod
npm run promote:main     # prod → main
```

For detailed setup instructions, see [docs/ops/SETUP_GUIDE.md](docs/ops/SETUP_GUIDE.md).

## 🔧 Environment Variables

### Required Keys (Non-Secrets)

```bash
# Core App
APP_ENV="development"                    # development | staging | production
APP_URL="http://localhost:3000"          # Base URL for the application
DATABASE_URL="postgresql://..."          # PostgreSQL connection string

# Feature Flags (All OFF by default)
FEATURE_BILLING_ENABLED="false"          # Enable Stripe billing integration
FEATURE_OBSERVABILITY="false"            # Enable logging, metrics, and tracing
FEATURE_DEMO_AUTH="false"                # Enable demo authentication mode
FEATURE_REALTIME="false"                 # Enable real-time notifications
FEATURE_AI_AUDIT_V2="false"             # Enable AI-powered brand auditing
FEATURE_AI_MATCH_V2="false"             # Enable AI-powered brand matching
FEATURE_MEDIA_PACK_V2="false"           # Enable enhanced media pack generation
FEATURE_BRAND_RUN_ONETOUCH="false"      # Enable one-touch brand run workflow
FEATURE_EXA_ENABLED="false"             # Enable Exa AI search integration
FEATURE_GOOGLE_PLACES_ENABLED="false"   # Enable Google Places API integration
FEATURE_INSTAGRAM_ENABLED="false"       # Enable Instagram integration
FEATURE_TIKTOK_ENABLED="false"          # Enable TikTok integration
FEATURE_YOUTUBE_ENABLED="false"         # Enable YouTube integration
FEATURE_COMPLIANCE_MODE="false"          # Enable compliance mode
FEATURE_SAFETY_MODERATION="false"        # Enable AI content safety checks
FEATURE_EXPORTS_ENABLED="false"          # Enable data exports
FEATURE_RETENTION_ENABLED="false"        # Enable data retention policies
```

### How Flags Map to Behavior

- **FEATURE_BILLING_ENABLED**: Gates Stripe API calls, billing UI, and subscription management
- **FEATURE_OBSERVABILITY**: Enables structured logging, metrics collection, and tracing
- **FEATURE_DEMO_AUTH**: Provides demo user authentication for development/testing
- **FEATURE_REALTIME**: Enables WebSocket connections and real-time notifications
- **FEATURE_AI_AUDIT_V2**: Enables AI-powered brand analysis and scoring
- **FEATURE_AI_MATCH_V2**: Enables AI-powered brand matching algorithms
- **FEATURE_MEDIA_PACK_V2**: Enables enhanced media pack generation and templates
- **FEATURE_BRAND_RUN_ONETOUCH**: Enables automated brand run workflows
- **FEATURE_EXA_ENABLED**: Enables AI-powered search and content discovery
- **FEATURE_GOOGLE_PLACES_ENABLED**: Enables business location data and search
- **FEATURE_COMPLIANCE_MODE**: Enables data governance and compliance features
- **FEATURE_SAFETY_MODERATION**: Enables AI content filtering and safety checks

### Env Rules

**Never import `env.ts` from client components** - it contains server-only secrets and will cause build errors.

**Use `flag()` for boolean values** - the `flag()` function safely converts string env vars to booleans:
```typescript
import { flag } from '@/lib/env'

if (flag(process.env.FEATURE_BILLING_ENABLED)) {
  // Billing feature is enabled
}
```

**Prefer server-only usage** - environment variables should be read server-side and passed to clients as needed through props or API responses.

**Client-safe variables** - Use `NEXT_PUBLIC_` prefix for variables that need to be accessible in the browser.

## 🚀 Deployment

### Netlify Deployment

This project is configured for static export and Netlify deployment:

1. **Automatic Deployment**: Push to `feature/workflow-skeleton-setup` branch triggers automatic Netlify deployment
2. **Build Command**: `pnpm install && pnpm build:static`
3. **Publish Directory**: `out/`
4. **Environment**: Node.js 20, pnpm 8

### Manual Deployment

```bash
# Install dependencies
pnpm install

# Build for production
pnpm build:static

# Deploy to Netlify
netlify deploy --prod --dir=out
```

## 📋 Release Runbook

### Automated Release Process

Use the release runner script for automated deployments:

```bash
# Full release process (recommended)
node scripts/release/release.mjs STAGING
node scripts/release/release.mjs PRODUCTION

# With options
node scripts/release/release.mjs PRODUCTION --mock
node scripts/release/release.mjs STAGING --non-interactive
```

### Manual Release Steps

#### 1. Environment Validation
```bash
# Validate staging environment
node scripts/release/01_check-env.mjs STAGING

# Validate production environment  
node scripts/release/01_check-env.mjs PRODUCTION
```

#### 2. Database Migration
```bash
# Run migrations for staging
node scripts/release/02_db-migrate.mjs

# Run migrations for production
node scripts/release/02_db-migrate.mjs
```

#### 3. Smoke Tests
```bash
# Test staging endpoints
node scripts/release/03_smoke.mjs STAGING

# Test production endpoints
node scripts/release/03_smoke.mjs PRODUCTION
```

#### 4. Cache Warming
```bash
# Warm staging cache
node scripts/release/04_cache-warm.mjs STAGING

# Warm production cache (with mock data if needed)
node scripts/release/04_cache-warm.mjs PRODUCTION --mock
```

### Staging Deployment Checklist

```bash
# 1. Validate environment
node scripts/release/01_check-env.mjs STAGING

# 2. Deploy database changes
node scripts/release/02_db-migrate.mjs

# 3. Verify endpoints work
node scripts/release/03_smoke.mjs STAGING

# 4. Prime cache for performance
node scripts/release/04_cache-warm.mjs STAGING

# 5. Manual verification
curl https://staging.yourdomain.com/api/health
curl https://staging.yourdomain.com/api/contacts
```

### Production Deployment Checklist

```bash
# 1. Validate production environment
node scripts/release/01_check-env.mjs PRODUCTION

# 2. Deploy database changes
node scripts/release/02_db-migrate.mjs

# 3. Verify production endpoints
node scripts/release/03_smoke.mjs PRODUCTION

# 4. Warm production cache
node scripts/release/04_cache-warm.mjs PRODUCTION

# 5. Post-deployment verification
curl https://yourdomain.com/api/health
curl https://yourdomain.com/api/billing/summary
```

### Troubleshooting

#### Common Issues

- **Environment validation fails**: Check `.env.local` and required variables
- **Database migration fails**: Verify `DATABASE_URL` and database connectivity
- **Smoke tests fail**: Ensure application is running and accessible
- **Cache warming fails**: Check if endpoints require authentication

#### Rollback Commands

```bash
# Revert to previous database migration
npx prisma migrate reset

# Check migration status
npx prisma migrate status

# View migration history
npx prisma migrate status --schema=prisma/schema.prisma
```

## 🔌 Integrations

For detailed setup instructions for external services, see [docs/integrations.md](docs/integrations.md).

### Quick Integration Setup

```bash
# Enable integrations via feature flags
FEATURE_EXA_ENABLED=true              # AI search
FEATURE_GOOGLE_PLACES_ENABLED=true    # Business data
FEATURE_INSTAGRAM_ENABLED=true        # Social media
FEATURE_TIKTOK_ENABLED=true           # Creator analytics
FEATURE_YOUTUBE_ENABLED=true          # Video insights

# Set required API keys
EXA_API_KEY="your_key"
GOOGLE_PLACES_API_KEY="your_key"
INSTAGRAM_APP_ID="your_app_id"
```

### Current Status

- ✅ UI Components: Premium theme, MVP navigation, component system
- ✅ Static Export: Configured for Netlify deployment
- ✅ Release Scripts: Automated deployment validation and setup
- ✅ Integrations: Comprehensive setup guide for all services
- 🔄 API Routes: Temporarily disabled for static export
- 🔄 Database: Prisma configured but not required for static demo

## 🎨 Features

- **Premium UI**: Neutral light theme with OKLCH color tokens
- **MVP Navigation**: Dashboard, Brand Run, Contacts, CRM, Settings
- **Component System**: Button, SocialLogo, StepperPro, SidebarNav
- **Responsive Design**: Mobile-first with Tailwind CSS
- **Type Safety**: Full TypeScript support

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build project
pnpm build

# Run tests
pnpm test:e2e:demo
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
├── components/            # Reusable UI components
├── services/              # Business logic services
├── lib/                   # Utilities and configuration
└── types/                 # TypeScript type definitions
```

## 🔧 Configuration

- **Next.js 15.5.0**: App router with static export
- **Tailwind CSS 4**: Utility-first CSS framework
- **Prisma**: Database ORM (PostgreSQL)
- **Playwright**: End-to-end testing
- **ESLint**: Code quality and UI rules enforcement

## 🚀 Development Environment

### Local Development Setup

For local development without full authentication, you can set these environment variables in your `.env.local`:

```bash
# Enable development auth bypass for contacts API
ENABLE_DEV_AUTH_BYPASS=1

# Set default workspace ID for dev
DEV_WORKSPACE_ID=demo-workspace
```

**Note**: These variables are for development only and will not affect production builds.
# Trigger Netlify build - Sat Aug 30 13:15:31 BST 2025
# Deploy attempt 13:18:55
