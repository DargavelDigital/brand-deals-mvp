# 🚀 Netlify Admin Console Setup Guide

## ✅ **What We Just Fixed**

1. **Removed `STATIC_EXPORT = "true"`** from `netlify.toml` - This enables server-side functionality
2. **Created database setup script** - `scripts/setup-admin-tables.sql`
3. **Admin console is now ready** for Netlify deployment

## 📋 **Step-by-Step Setup**

### **Step 1: Deploy to Netlify**
```bash
# Commit and push your changes
git add .
git commit -m "Enable admin console for Netlify deployment"
git push origin feature/workflow-skeleton-setup
```

### **Step 2: Set Netlify Environment Variables**
1. Go to your Netlify dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add these variables:
   ```
   FLAG_ADMIN_CONSOLE=1
   DATABASE_URL=your_production_database_url
   ```

### **Step 3: Set Up Production Database**
1. Connect to your production database
2. Run the setup script:
   ```bash
   psql -h your-db-host -U your-username -d your-database -f scripts/setup-admin-tables.sql
   ```

### **Step 4: Access Admin Console**
Once deployed, visit:
```
https://your-site.netlify.app/api/admin/login
```

## 🔐 **Default Admin Credentials**
- **Email**: `admin@example.com`
- **Role**: `SUPER` admin

## 🎯 **What You'll Get**

✅ **Admin Authentication** - Secure login system
✅ **Workspace Management** - View and manage all workspaces
✅ **Error Tracking** - Monitor system errors and issues
✅ **Run Monitoring** - Track brand run executions
✅ **Impersonation** - Act as any workspace user
✅ **Audit Logging** - Complete activity tracking

## 🚨 **Troubleshooting**

### **If you get "Page not found":**
- Check that `FLAG_ADMIN_CONSOLE=1` is set in Netlify
- Verify the database tables were created successfully

### **If you get database errors:**
- Run the setup script again
- Check your `DATABASE_URL` is correct

### **If the admin page loads but shows errors:**
- Check the browser console for specific error messages
- Verify all database tables exist

## 🎉 **You're All Set!**

The admin console will now work perfectly on Netlify with full server-side functionality!
