-- EPIC 18: Admin Console Database Setup
-- Run this on your production database to enable admin functionality

-- 1. Create AdminRole enum
DO $$ BEGIN
    CREATE TYPE "AdminRole" AS ENUM ('SUPER', 'SUPPORT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Admin table
CREATE TABLE IF NOT EXISTS "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'SUPER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- 3. Create unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email");

-- 4. Create ImpersonationSession table
CREATE TABLE IF NOT EXISTS "ImpersonationSession" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "reason" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    CONSTRAINT "ImpersonationSession_pkey" PRIMARY KEY ("id")
);

-- 5. Create RunStepExecution table
CREATE TABLE IF NOT EXISTS "RunStepExecution" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "stepName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "result" JSONB,
    "error" TEXT,
    CONSTRAINT "RunStepExecution_pkey" PRIMARY KEY ("id")
);

-- 6. Create ErrorEvent table
CREATE TABLE IF NOT EXISTS "ErrorEvent" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "error" TEXT NOT NULL,
    "stack" TEXT,
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ErrorEvent_pkey" PRIMARY KEY ("id")
);

-- 7. Add missing columns to Workspace table
ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "featureFlags" JSONB DEFAULT '{}';
ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "aiTokensBalance" INTEGER DEFAULT 0;
ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "emailBalance" INTEGER DEFAULT 0;
ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "emailDailyUsed" INTEGER DEFAULT 0;
ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "periodEnd" TIMESTAMP(3);
ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "periodStart" TIMESTAMP(3);
ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "plan" TEXT DEFAULT 'FREE';
ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT;
ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "stripeSubId" TEXT;

-- 8. Add missing columns to Audit table (if it exists)
DO $$ BEGIN
    ALTER TABLE "Audit" ADD COLUMN "adminId" TEXT;
    ALTER TABLE "Audit" ADD COLUMN "traceId" TEXT;
    ALTER TABLE "Audit" ADD COLUMN "ip" TEXT;
    ALTER TABLE "Audit" ADD COLUMN "ua" TEXT;
EXCEPTION
    WHEN undefined_column THEN null;
END $$;

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS "Workspace_deletedAt_idx" ON "Workspace"("deletedAt");
CREATE INDEX IF NOT EXISTS "ImpersonationSession_workspaceId_tokenHash_idx" ON "ImpersonationSession"("workspaceId", "tokenHash");
CREATE INDEX IF NOT EXISTS "RunStepExecution_runId_idx" ON "RunStepExecution"("runId");
CREATE INDEX IF NOT EXISTS "ErrorEvent_workspaceId_createdAt_idx" ON "ErrorEvent"("workspaceId", "createdAt");

-- 10. Add foreign key constraints
ALTER TABLE "ImpersonationSession" ADD CONSTRAINT IF NOT EXISTS "ImpersonationSession_adminId_fkey" 
    FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ImpersonationSession" ADD CONSTRAINT IF NOT EXISTS "ImpersonationSession_workspaceId_fkey" 
    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RunStepExecution" ADD CONSTRAINT IF NOT EXISTS "RunStepExecution_runId_fkey" 
    FOREIGN KEY ("runId") REFERENCES "BrandRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ErrorEvent" ADD CONSTRAINT IF NOT EXISTS "ErrorEvent_workspaceId_fkey" 
    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 11. Insert a default admin user (change email as needed)
INSERT INTO "Admin" ("id", "email", "role") 
VALUES ('admin-default', 'admin@example.com', 'SUPER')
ON CONFLICT ("email") DO NOTHING;

-- 12. Create unique constraint for stripeCustomerId
CREATE UNIQUE INDEX IF NOT EXISTS "Workspace_stripeCustomerId_key" ON "Workspace"("stripeCustomerId") WHERE "stripeCustomerId" IS NOT NULL;

PRINT 'Admin Console Database Setup Complete!';
PRINT 'Default admin user: admin@example.com';
PRINT 'You can now access /admin on your Netlify site';
