# Environment Configuration for Instagram-Only Launch

## Overview
This document provides the environment variable configuration for the Instagram-only launch with all tools visible but only Instagram provider enabled.

## Local Development (.env.local)

Add these variables to your `.env.local` file:

```bash
# Provider Enablement (Instagram only for launch)
NEXT_PUBLIC_PROVIDER_INSTAGRAM_ENABLED=true
NEXT_PUBLIC_PROVIDER_TIKTOK_ENABLED=false
NEXT_PUBLIC_PROVIDER_YOUTUBE_ENABLED=false
NEXT_PUBLIC_PROVIDER_X_ENABLED=false
NEXT_PUBLIC_PROVIDER_FACEBOOK_ENABLED=false
NEXT_PUBLIC_PROVIDER_LINKEDIN_ENABLED=false

# Tool Enablement (all tools visible by default)
# Tools default to true when unset, so we only set false for truly unready tools
# NEXT_PUBLIC_TOOL_CONTACTS_ENABLED=true
# NEXT_PUBLIC_TOOL_INBOX_ENABLED=true
# NEXT_PUBLIC_TOOL_DEALDESK_ENABLED=true
# NEXT_PUBLIC_TOOL_IMPORT_ENABLED=true
# NEXT_PUBLIC_TOOL_PACK_ENABLED=true
# NEXT_PUBLIC_TOOL_MATCHES_ENABLED=true
# NEXT_PUBLIC_TOOL_AUDIT_ENABLED=true
# NEXT_PUBLIC_TOOL_APPROVE_ENABLED=true
# NEXT_PUBLIC_TOOL_OUTREACH_ENABLED=true
# NEXT_PUBLIC_TOOL_CONNECT_ENABLED=true

# Contacts Tool Configuration
# Enable demo mode for Discover Contacts (independent of Instagram)
NEXT_PUBLIC_CONTACTS_DEMO_MODE=true

# External Provider API Keys (optional - for live data)
# APOLLO_API_KEY=your_apollo_key_here
# HUNTER_API_KEY=your_hunter_key_here
# EXA_API_KEY=your_exa_key_here

# Legacy flag (kept for compatibility only; unused for gating pages)
NEXT_PUBLIC_LAUNCH_INSTAGRAM_ONLY=true
```

## Netlify Environment Variables

Set these in your Netlify dashboard for all environments (dev, staging, prod):

### Provider Settings
- `NEXT_PUBLIC_PROVIDER_INSTAGRAM_ENABLED` = `true`
- `NEXT_PUBLIC_PROVIDER_TIKTOK_ENABLED` = `false`
- `NEXT_PUBLIC_PROVIDER_YOUTUBE_ENABLED` = `false`
- `NEXT_PUBLIC_PROVIDER_X_ENABLED` = `false`
- `NEXT_PUBLIC_PROVIDER_FACEBOOK_ENABLED` = `false`
- `NEXT_PUBLIC_PROVIDER_LINKEDIN_ENABLED` = `false`

### Tool Settings (Optional - only set if tool is truly not ready)
- `NEXT_PUBLIC_TOOL_CONTACTS_ENABLED` = `true` (or leave unset)
- `NEXT_PUBLIC_TOOL_INBOX_ENABLED` = `true` (or leave unset)
- `NEXT_PUBLIC_TOOL_DEALDESK_ENABLED` = `true` (or leave unset)
- `NEXT_PUBLIC_TOOL_IMPORT_ENABLED` = `true` (or leave unset)
- `NEXT_PUBLIC_TOOL_PACK_ENABLED` = `true` (or leave unset)
- `NEXT_PUBLIC_TOOL_MATCHES_ENABLED` = `true` (or leave unset)
- `NEXT_PUBLIC_TOOL_AUDIT_ENABLED` = `true` (or leave unset)
- `NEXT_PUBLIC_TOOL_APPROVE_ENABLED` = `true` (or leave unset)
- `NEXT_PUBLIC_TOOL_OUTREACH_ENABLED` = `true` (or leave unset)
- `NEXT_PUBLIC_TOOL_CONNECT_ENABLED` = `true` (or leave unset)

### Legacy Settings
- `NEXT_PUBLIC_LAUNCH_INSTAGRAM_ONLY` = `true`

## Behavior

### Provider Behavior
- **Instagram**: Fully enabled, shows "Connect" button
- **TikTok, YouTube, X, Facebook, LinkedIn**: Show "Coming soon" badges and disabled state

### Tool Behavior
- **All Tools**: Visible in navigation with "Coming soon" badges if disabled
- **Enabled Tools**: Show full functionality
- **Disabled Tools**: Show ComingSoon card with "This tool will be enabled soon" message

### Navigation
- All navigation items are always visible
- Disabled tools show subtle "Coming soon" StatusPill badges
- Users can click any navigation item (no 404s)

### API Responses
- Disabled tools return `{ ok: false, mode: 'DISABLED' }` with 200 status
- No more 404/501 errors for disabled features
- Pages handle disabled state gracefully

## Quick Setup Commands

### Local Development
```bash
# Add to .env.local
echo "NEXT_PUBLIC_PROVIDER_INSTAGRAM_ENABLED=true" >> .env.local
echo "NEXT_PUBLIC_PROVIDER_TIKTOK_ENABLED=false" >> .env.local
echo "NEXT_PUBLIC_PROVIDER_YOUTUBE_ENABLED=false" >> .env.local
echo "NEXT_PUBLIC_PROVIDER_X_ENABLED=false" >> .env.local
echo "NEXT_PUBLIC_PROVIDER_FACEBOOK_ENABLED=false" >> .env.local
echo "NEXT_PUBLIC_PROVIDER_LINKEDIN_ENABLED=false" >> .env.local
echo "NEXT_PUBLIC_LAUNCH_INSTAGRAM_ONLY=true" >> .env.local
```

### Netlify CLI (if using)
```bash
# Set environment variables via Netlify CLI
netlify env:set NEXT_PUBLIC_PROVIDER_INSTAGRAM_ENABLED true
netlify env:set NEXT_PUBLIC_PROVIDER_TIKTOK_ENABLED false
netlify env:set NEXT_PUBLIC_PROVIDER_YOUTUBE_ENABLED false
netlify env:set NEXT_PUBLIC_PROVIDER_X_ENABLED false
netlify env:set NEXT_PUBLIC_PROVIDER_FACEBOOK_ENABLED false
netlify env:set NEXT_PUBLIC_PROVIDER_LINKEDIN_ENABLED false
netlify env:set NEXT_PUBLIC_LAUNCH_INSTAGRAM_ONLY true
```

## Notes

- Tools default to `true` when their environment variable is unset
- Only set `NEXT_PUBLIC_TOOL_*_ENABLED=false` for tools that are truly not ready
- The `NEXT_PUBLIC_LAUNCH_INSTAGRAM_ONLY` flag is kept for compatibility but not used for page gating
- All pages render with 200 status, no more 404s for disabled features
