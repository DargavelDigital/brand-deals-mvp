#!/bin/bash

# Production Database Setup Script for Brand Deals MVP
# This script helps set up production database connections

set -e

echo "🌍 Production Database Setup for Brand Deals MVP"
echo "================================================"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set your production database URL:"
    echo "export DATABASE_URL=\"postgresql://username:password@host:port/database\""
    echo ""
    echo "Example for Supabase:"
    echo "export DATABASE_URL=\"postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres\""
    echo ""
    echo "Example for Neon:"
    echo "export DATABASE_URL=\"postgresql://[user]:[password]@[endpoint]/[database]?sslmode=require\""
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo "🔗 Testing database connection..."

# Test database connection
if pnpm prisma db pull --force > /dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    echo ""
    echo "Please check:"
    echo "1. Database URL is correct"
    echo "2. Database is accessible from your deployment environment"
    echo "3. Firewall/security group allows connections"
    echo "4. Database user has necessary permissions"
    echo ""
    exit 1
fi

echo ""
echo "🔄 Running production migrations..."
pnpm prisma migrate deploy

echo "🔧 Generating Prisma client..."
pnpm prisma generate

echo ""
echo "✅ Production database setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set DEMO_MODE=false in your environment"
echo "2. Configure production API keys"
echo "3. Set strong NEXTAUTH_SECRET"
echo "4. Deploy your application"
echo ""
echo "🔐 Security reminders:"
echo "- Use strong, unique passwords"
echo "- Enable SSL connections"
echo "- Restrict database access by IP"
echo "- Set up automated backups"
echo "- Monitor database performance"
