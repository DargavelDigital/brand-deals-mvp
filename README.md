# Brand Deals MVP

A premium SaaS platform for brand-influencer partnerships with AI-powered matching and workflow automation.

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
