#!/bin/bash

# Setup script for Instagram-only launch environment variables
# This script adds the necessary environment variables to .env.local

echo "Setting up Instagram-only launch environment variables..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "Error: .env.local file not found. Please create it first."
    exit 1
fi

# Backup existing .env.local
cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
echo "Backed up existing .env.local"

# Add provider enablement variables
echo "" >> .env.local
echo "# Provider Enablement (Instagram only for launch)" >> .env.local
echo "NEXT_PUBLIC_PROVIDER_INSTAGRAM_ENABLED=true" >> .env.local
echo "NEXT_PUBLIC_PROVIDER_TIKTOK_ENABLED=false" >> .env.local
echo "NEXT_PUBLIC_PROVIDER_YOUTUBE_ENABLED=false" >> .env.local
echo "NEXT_PUBLIC_PROVIDER_X_ENABLED=false" >> .env.local
echo "NEXT_PUBLIC_PROVIDER_FACEBOOK_ENABLED=false" >> .env.local
echo "NEXT_PUBLIC_PROVIDER_LINKEDIN_ENABLED=false" >> .env.local

# Add tool enablement section (commented out by default)
echo "" >> .env.local
echo "# Tool Enablement (all tools visible by default)" >> .env.local
echo "# Tools default to true when unset, so we only set false for truly unready tools" >> .env.local
echo "# NEXT_PUBLIC_TOOL_CONTACTS_ENABLED=true" >> .env.local
echo "# NEXT_PUBLIC_TOOL_INBOX_ENABLED=true" >> .env.local
echo "# NEXT_PUBLIC_TOOL_DEALDESK_ENABLED=true" >> .env.local
echo "# NEXT_PUBLIC_TOOL_IMPORT_ENABLED=true" >> .env.local
echo "# NEXT_PUBLIC_TOOL_PACK_ENABLED=true" >> .env.local
echo "# NEXT_PUBLIC_TOOL_MATCHES_ENABLED=true" >> .env.local
echo "# NEXT_PUBLIC_TOOL_AUDIT_ENABLED=true" >> .env.local
echo "# NEXT_PUBLIC_TOOL_APPROVE_ENABLED=true" >> .env.local
echo "# NEXT_PUBLIC_TOOL_OUTREACH_ENABLED=true" >> .env.local
echo "# NEXT_PUBLIC_TOOL_CONNECT_ENABLED=true" >> .env.local

# Add legacy flag
echo "" >> .env.local
echo "# Legacy flag (kept for compatibility only; unused for gating pages)" >> .env.local
echo "NEXT_PUBLIC_LAUNCH_INSTAGRAM_ONLY=true" >> .env.local

echo "✅ Environment variables added to .env.local"
echo "📋 Please review the changes and restart your development server"
echo "🔧 For Netlify, set these same variables in your dashboard"
