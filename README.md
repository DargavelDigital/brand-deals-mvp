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

### Current Status

- ✅ UI Components: Premium theme, MVP navigation, component system
- ✅ Static Export: Configured for Netlify deployment
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
# Trigger Netlify build - Sat Aug 30 13:15:31 BST 2025
