# 🗄️ PRODUCTION DATABASE UPDATE GUIDE

Your Prisma schema is already correct! The issue is that your **production database on Neon** hasn't been updated yet.

---

## 🎯 OPTION 1: Run SQL Script in Neon Console (RECOMMENDED)

This is the **safest and easiest** method:

### Step 1: Open Neon Console
1. Go to: https://console.neon.tech
2. Sign in to your account
3. Select your database project

### Step 2: Open SQL Editor
1. Click **"SQL Editor"** in the left sidebar
2. You'll see a query editor

### Step 3: Run the Migration Script
1. Open the file **`update-mediapack-schema.sql`** in your project
2. Copy the entire contents
3. Paste into the Neon SQL Editor
4. Click **"Run"**

### Step 4: Verify
The script will automatically show you all columns. You should see these new columns added:
- `brandId`
- `brandName`
- `fileUrl`
- `fileId`
- `fileName`
- `format`
- `status`
- `generatedAt`

---

## 🎯 OPTION 2: Use Prisma Migrate (Advanced)

If you prefer using Prisma CLI:

### Step 1: Set Production Database URL
```bash
export DATABASE_URL="your-production-neon-url"
```

### Step 2: Push Schema to Production
```bash
npx prisma db push
```

**⚠️ WARNING:** This will modify your **production database** directly!

---

## ✅ VERIFICATION

After running either option, test by generating a PDF:

**Expected Console Output:**
```
💾 Saving media pack: { packId, workspaceId, brandName: Hootsuite, fileUrl: ✓ }
✅ Media pack saved: mp_1234567890_abc123
```

**Expected UI:**
```
✅ Hootsuite - Success! Ready to share 🔗
✅ Canva - Success! Ready to share 🔗
✅ Sprout Social - Success! Ready to share 🔗
```

---

## 🐛 TROUBLESHOOTING

### Error: "column does not exist"
- The migration script hasn't run yet
- Run the SQL script in Neon console

### Error: "relation does not exist"
- Wrong database connected
- Make sure you're running the script on the production database

### Success but no data showing
- Clear your browser cache
- Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

---

## 📊 WHAT THE UPDATE DOES

**Adds Missing Columns:**
```sql
ALTER TABLE "MediaPack" ADD COLUMN "brandId" TEXT;
ALTER TABLE "MediaPack" ADD COLUMN "brandName" TEXT;
ALTER TABLE "MediaPack" ADD COLUMN "fileUrl" TEXT;
ALTER TABLE "MediaPack" ADD COLUMN "fileId" TEXT;
ALTER TABLE "MediaPack" ADD COLUMN "fileName" TEXT;
ALTER TABLE "MediaPack" ADD COLUMN "format" TEXT DEFAULT 'pdf';
ALTER TABLE "MediaPack" ADD COLUMN "status" TEXT DEFAULT 'READY';
ALTER TABLE "MediaPack" ADD COLUMN "generatedAt" TIMESTAMPTZ DEFAULT NOW();
```

**Creates Index:**
```sql
CREATE INDEX "MediaPack_brandId_idx" ON "MediaPack"("brandId");
```

**Safe to Run Multiple Times:**
- Script checks if columns exist before adding
- Won't fail if columns already there
- Won't duplicate or corrupt data

---

## 🚀 AFTER MIGRATION

Once the database is updated:

1. ✅ **Vercel redeploys** (code already pushed)
2. ✅ **PDF generation works** end-to-end
3. ✅ **Database tracking** fully functional
4. ✅ **Media pack history** available

**No code changes needed - just update the database!**

---

## 📝 QUICK CHECKLIST

- [ ] Open Neon Console
- [ ] Navigate to SQL Editor
- [ ] Copy/paste `update-mediapack-schema.sql`
- [ ] Click Run
- [ ] Verify columns added
- [ ] Test PDF generation on production
- [ ] Confirm success messages
- [ ] Check database for saved PDFs

---

**The schema is ready, the code is deployed - just need to update the production database!** 🎉

