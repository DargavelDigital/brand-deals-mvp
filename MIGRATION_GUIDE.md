# 🔄 DATABASE MIGRATION GUIDE

## 🎯 YOUR SITUATION

You have **schema changes** ready to deploy:
- ✅ `Contact.unsubscribed` field (for CAN-SPAM compliance)
- ✅ `UnsubscribeToken` model (for unsubscribe tracking)

**Current Issue**: Your `.env.local` has a placeholder DATABASE_URL (`localhost:5432`)

**Your Setup** [[memory:9727348]]:
- 🚀 **Deploys to**: Vercel
- 💾 **Database**: Netlify (remote PostgreSQL)

---

## 🛠️ **SOLUTION: 3 WAYS TO MIGRATE**

Choose the method that works best for you:

---

### **METHOD 1: Update .env.local with Real Database URL (Recommended)**

**Step 1**: Get your **Netlify database connection string**

1. Go to Netlify dashboard
2. Navigate to your database
3. Copy the **connection string** (should look like):
   ```
   postgresql://user:password@hostname.netlify.app:5432/database_name
   ```

**Step 2**: Update your local `.env.local`

```bash
# Open .env.local and replace the DATABASE_URL with your real one:
DATABASE_URL="postgresql://your-real-netlify-connection-string"
```

**Step 3**: Run the migration locally

```bash
cd /Users/paulcaruana/brand-deals-mvp

# This will connect to your Netlify database and apply the migration
pnpm prisma migrate dev --name add_unsubscribe_support

# Generate the Prisma client
pnpm prisma generate
```

✅ **Advantages**:
- You can test locally before deploying
- Full control over migration process
- Can rollback if needed

---

### **METHOD 2: Deploy to Vercel and Let Netlify Handle It**

Since you deploy to Vercel and use Netlify for database, you can:

**Step 1**: Push your code to GitHub

```bash
cd /Users/paulcaruana/brand-deals-mvp

# Add all the new files
git add .

# Commit with descriptive message
git commit -m "feat: add unsubscribe system and open tracking for outreach

- Add /api/outreach/send endpoint for quick email sending
- Add email open tracking with tracking pixels
- Add CAN-SPAM compliant unsubscribe links and page
- Add Contact.unsubscribed field to database
- Add UnsubscribeToken model for unsubscribe tracking
- Consolidate outreach routes (redirect /outreach to /tools/outreach)
- Update queue route to include tracking pixels and unsubscribe links"

# Push to your branch
git push origin main
```

**Step 2**: Vercel will auto-deploy

**Step 3**: Run migration on Netlify

Option A - **Via Netlify CLI**:
```bash
# Install Netlify CLI if needed
npm install -g netlify-cli

# Login
netlify login

# Run migration on production database
netlify env:import .env.local  # Import your env vars
DATABASE_URL="your-netlify-db-url" pnpm prisma migrate deploy
```

Option B - **Via Vercel build command**:
Add to your `package.json` build script:
```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

✅ **Advantages**:
- No need to expose production credentials locally
- Automatic on every deploy
- Production-first approach

---

### **METHOD 3: Manual SQL Migration (Quick & Safe)**

If you just want to get it working **right now**:

**Step 1**: Get your Netlify database URL

**Step 2**: Use a DB client (like TablePlus, pgAdmin, or psql) to connect

**Step 3**: Run this SQL directly:

```sql
-- Add unsubscribed field to Contact model
ALTER TABLE "Contact" ADD COLUMN "unsubscribed" BOOLEAN NOT NULL DEFAULT false;

-- Create UnsubscribeToken table
CREATE TABLE "UnsubscribeToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnsubscribeToken_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE UNIQUE INDEX "UnsubscribeToken_token_key" ON "UnsubscribeToken"("token");
CREATE INDEX "UnsubscribeToken_token_idx" ON "UnsubscribeToken"("token");
CREATE INDEX "UnsubscribeToken_email_idx" ON "UnsubscribeToken"("email");
CREATE INDEX "UnsubscribeToken_workspaceId_idx" ON "UnsubscribeToken"("workspaceId");
```

**Step 4**: Generate Prisma client locally:
```bash
pnpm prisma generate
```

✅ **Advantages**:
- Fastest method
- No migration file needed
- Works immediately

---

## 🧪 **TESTING WITHOUT MIGRATION**

If you want to test the **code changes** without the database migration:

**What works**:
- ✅ Route redirect (`/outreach` → `/tools/outreach`)
- ✅ Email sending logic (will skip unsubscribe token creation)
- ✅ Tracking pixel injection
- ✅ Unsubscribe page UI (will show "invalid token" until migration runs)

**What won't work until migration**:
- ❌ Unsubscribe token storage
- ❌ Contact unsubscribe status checking

**To test now**:

```bash
# Just generate the Prisma client with your current schema
pnpm prisma generate

# Start dev server
pnpm dev

# Test the route redirect and UI
# Database writes for unsubscribe will fail gracefully
```

---

## 🎯 **RECOMMENDED APPROACH**

**For immediate testing**: Use **Method 3** (manual SQL)
- Fast
- Safe
- You can test everything right away

**For production**: Use **Method 2** (deploy to Vercel)
- Automated
- Follows your deployment workflow
- Migration happens on every deploy

---

## 🔍 **HOW TO GET YOUR NETLIFY DATABASE URL**

### Via Netlify Dashboard:
1. Go to https://app.netlify.com
2. Select your site
3. Go to **Environment variables** or **Database** section
4. Copy your `DATABASE_URL` connection string

### Via Netlify CLI:
```bash
netlify env:list
```

### It should look like:
```
postgresql://user:pass@hostname.netlify.app:5432/dbname
```

---

## ✅ **VERIFICATION CHECKLIST**

After migration (any method):

```bash
# Check the schema is updated
pnpm prisma db pull

# Verify tables exist
pnpm prisma studio
# Look for:
# - Contact.unsubscribed column
# - UnsubscribeToken table
```

---

## 🚨 **TROUBLESHOOTING**

### Error: "Can't reach database"
→ Your DATABASE_URL is wrong or database is down
→ Check connection string in Netlify dashboard

### Error: "Table already exists"
→ Migration already ran (safe to ignore)
→ Just run `pnpm prisma generate`

### Error: "Column already exists"  
→ Schema already updated (safe to ignore)
→ Just run `pnpm prisma generate`

---

## 📞 **NEED HELP?**

**Quick Decision Tree**:
1. Do you have your Netlify DATABASE_URL handy?
   - **YES** → Use Method 1 (update .env.local)
   - **NO** → Use Method 3 (manual SQL)

2. Want to test before deploying?
   - **YES** → Use Method 1 or 3
   - **NO** → Use Method 2 (push to production)

3. Just want it working NOW?
   - Use Method 3 (manual SQL) - takes 2 minutes!

---

**Choose your method and let me know which one you want to use!** 🚀

