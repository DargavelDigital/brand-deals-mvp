# Deployment Guide

## Environment Variables Setup

### Required Environment Variables

#### 1. DATABASE_URL
**Required for:** Database operations, Prisma client functionality

**Format:** `postgresql://username:password@host:port/database_name`

**Example:** `postgresql://myuser:mypassword@localhost:5432/myapp`

**How to set in Netlify:**
1. Go to your Netlify dashboard
2. Navigate to **Site Settings** → **Environment Variables**
3. Click **Add a variable**
4. Set:
   - **Key:** `DATABASE_URL`
   - **Value:** Your PostgreSQL connection string
5. Click **Save**

**How to set locally:**
1. Create a `.env.local` file in your project root
2. Add: `DATABASE_URL=postgresql://username:password@host:port/database_name`
3. Restart your development server

### Optional Environment Variables

#### 2. NODE_ENV
**Purpose:** Determines build and runtime behavior

**Values:**
- `development` - Local development
- `production` - Production deployment

**Netlify automatically sets this to `production`**

#### 3. NETLIFY
**Purpose:** Identifies Netlify environment

**Netlify automatically sets this to `true`**

## Troubleshooting

### Error: "Environment variable not found: DATABASE_URL"

**Cause:** The `DATABASE_URL` environment variable is not set in your deployment environment.

**Solution:**
1. Verify `DATABASE_URL` is set in Netlify Environment Variables
2. Check that the connection string is correct
3. Ensure your database is accessible from Netlify's servers
4. Test the connection string locally first

### Error: "Prisma Client could not locate the Query Engine"

**Cause:** Prisma binaries for the target platform are missing.

**Solution:**
1. Ensure the build process includes `prisma generate`
2. Check that `binaryTargets` includes the correct platform
3. Verify the build completes successfully

### Database Connection Issues

**Common causes:**
1. **Firewall/Network:** Database not accessible from external IPs
2. **Credentials:** Incorrect username/password
3. **Database:** Database doesn't exist or is not running
4. **SSL:** SSL requirements not met

**Testing locally:**
```bash
# Test your connection string
psql "postgresql://username:password@host:port/database_name"
```

## Deployment Checklist

- [ ] `DATABASE_URL` environment variable set in Netlify
- [ ] Database accessible from external connections
- [ ] Prisma schema includes correct `binaryTargets`
- [ ] Build process includes Prisma generation
- [ ] All required environment variables configured
- [ ] Database migrations applied to production database

## Support

If you continue to experience issues:

1. Check Netlify build logs for detailed error messages
2. Verify environment variables are set correctly
3. Test database connectivity from external sources
4. Review Prisma documentation for deployment best practices
