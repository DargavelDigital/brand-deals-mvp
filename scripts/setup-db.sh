#!/bin/bash

# Database Setup Script for Brand Deals MVP
# This script sets up the database for both development and production

set -e

echo "🚀 Setting up Brand Deals MVP Database..."

# Check if PostgreSQL is running
if ! brew services list | grep -q "postgresql.*started"; then
    echo "❌ PostgreSQL is not running. Starting it now..."
    brew services start postgresql@15
    sleep 3
fi

# Create database if it doesn't exist
echo "📊 Creating database 'brand_deals_mvp' if it doesn't exist..."
createdb brand_deals_mvp 2>/dev/null || echo "Database already exists"

# Check if .env.local exists, if not create it
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/brand_deals_mvp"

# Demo Mode (set to false for production)
DEMO_MODE="true"

# Email Configuration
SENDGRID_API_KEY="your_sendgrid_api_key_here"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"

# Authentication
NEXTAUTH_SECRET="your_nextauth_secret_here"
NEXTAUTH_URL="http://localhost:3000"

# Credits System
CREDITS_ENABLED="true"
INITIAL_CREDITS="100"
EOF
    echo "✅ Created .env.local file"
    echo "⚠️  Please edit .env.local with your actual API keys and secrets"
else
    echo "✅ .env.local already exists"
fi

# Run Prisma migrations
echo "🔄 Running Prisma migrations..."
pnpm prisma migrate deploy

# Generate Prisma client
echo "🔧 Generating Prisma client..."
pnpm prisma generate

# Seed the database with initial data
echo "🌱 Seeding database with initial data..."
pnpm db:seed

echo "✅ Database setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env.local with your actual API keys"
echo "2. Start the development server: pnpm dev"
echo "3. Test the API endpoints at http://localhost:3000/api/..."
echo ""
echo "🌍 For production:"
echo "1. Set DATABASE_URL to your production PostgreSQL instance"
echo "2. Set DEMO_MODE=false"
echo "3. Configure all production API keys"
echo "4. Run: pnpm prisma migrate deploy"
