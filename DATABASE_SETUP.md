# Database Setup Guide for Brand Deals MVP

This guide covers setting up the database for both development and production environments.

## 🚀 Quick Start (Development)

### 1. Prerequisites
- PostgreSQL 15+ installed and running
- Node.js 20+ and pnpm installed

### 2. Local Database Setup
```bash
# Start PostgreSQL (if not running)
brew services start postgresql@15

# Create database
createdb brand_deals_mvp

# Set environment variables
export DATABASE_URL="postgresql://$(whoami)@localhost:5432/brand_deals_mvp"
export DEMO_MODE="true"
export NEXTAUTH_SECRET="your-secret-here"
export NEXTAUTH_URL="http://localhost:3000"

# Run migrations
pnpm prisma migrate deploy

# Generate Prisma client
pnpm prisma generate

# Seed database
pnpm db:seed
```

### 3. Environment File (.env.local)
```bash
# Database
DATABASE_URL="postgresql://$(whoami)@localhost:5432/brand_deals_mvp"

# Demo Mode
DEMO_MODE="true"

# Authentication
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Email (optional for development)
SENDGRID_API_KEY="your-key-here"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"

# Credits System
CREDITS_ENABLED="true"
INITIAL_CREDITS="100"
```

## 🌍 Production Setup

### 1. Database Options

#### Option A: Managed PostgreSQL (Recommended)
- **Supabase**: Free tier available, easy setup
- **Neon**: Serverless PostgreSQL, pay-per-use
- **PlanetScale**: MySQL-compatible, great scaling
- **AWS RDS**: Full control, enterprise features

#### Option B: Self-Hosted
- **DigitalOcean**: Managed PostgreSQL droplets
- **Linode**: PostgreSQL managed databases
- **VPS**: Install PostgreSQL manually

### 2. Production Environment Variables
```bash
# Database (replace with your production URL)
DATABASE_URL="postgresql://username:password@host:port/database"

# Demo Mode (disable for production)
DEMO_MODE="false"

# Authentication (use strong, unique secrets)
NEXTAUTH_SECRET="your-very-long-random-secret-here"
NEXTAUTH_URL="https://yourdomain.com"

# Email (required for production)
SENDGRID_API_KEY="your-production-sendgrid-key"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"

# Credits System
CREDITS_ENABLED="true"
INITIAL_CREDITS="100"

# Social Media APIs (for future features)
INSTAGRAM_ACCESS_TOKEN=""
TIKTOK_ACCESS_TOKEN=""
YOUTUBE_API_KEY=""
TWITTER_BEARER_TOKEN=""
```

### 3. Production Deployment Steps
```bash
# 1. Set production environment variables
# 2. Run migrations
pnpm prisma migrate deploy

# 3. Generate Prisma client
pnpm prisma generate

# 4. Seed production data (if needed)
pnpm db:seed

# 5. Build and deploy
pnpm build
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Connection Refused
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start if not running
brew services start postgresql@15
```

#### 2. Authentication Failed
```bash
# Check your username
whoami

# Use correct connection string
DATABASE_URL="postgresql://$(whoami)@localhost:5432/brand_deals_mvp"
```

#### 3. Database Doesn't Exist
```bash
# Create database
createdb brand_deals_mvp

# Or connect to PostgreSQL and create manually
psql postgres
CREATE DATABASE brand_deals_mvp;
```

#### 4. Migration Errors
```bash
# Reset database (WARNING: destroys all data)
pnpm prisma migrate reset --force

# Or check migration status
pnpm prisma migrate status
```

### 5. Prisma Client Issues
```bash
# Regenerate client
pnpm prisma generate

# Clear node_modules and reinstall
rm -rf node_modules
pnpm install
```

## 📊 Database Schema

The database includes these main models:
- **Workspace**: Multi-tenant workspaces
- **User**: User accounts and authentication
- **Brand**: Brand information and colors
- **BrandRun**: Workflow execution state
- **Audit**: AI audit results and insights
- **MediaPack**: Generated media packs
- **Deal**: Brand-influencer partnerships
- **Contact**: Discovered brand contacts

## 🔐 Security Considerations

### Production Security
1. **Strong Passwords**: Use complex database passwords
2. **Connection Limits**: Restrict database access by IP
3. **SSL**: Always use SSL connections in production
4. **Backups**: Regular automated backups
5. **Monitoring**: Database performance monitoring

### Environment Variables
- Never commit `.env` files to version control
- Use different secrets for each environment
- Rotate secrets regularly
- Use secret management services in production

## 📈 Scaling Considerations

### Database Scaling
- **Connection Pooling**: Configure appropriate pool sizes
- **Read Replicas**: For read-heavy workloads
- **Sharding**: For very large datasets
- **Caching**: Redis for frequently accessed data

### Application Scaling
- **Stateless Design**: API routes are stateless
- **Horizontal Scaling**: Multiple app instances
- **Load Balancing**: Distribute traffic evenly
- **CDN**: For static assets and media

## 🚀 Next Steps

1. **Test API Endpoints**: Verify all routes work
2. **Load Testing**: Test with realistic data volumes
3. **Monitoring**: Set up logging and monitoring
4. **Backup Strategy**: Implement automated backups
5. **Security Audit**: Review security configuration

## 📞 Support

For database issues:
1. Check Prisma documentation
2. Review PostgreSQL logs
3. Test connection manually
4. Check environment variables
5. Verify database permissions

---

**Remember**: Always backup your database before making schema changes!
