-- Fix the failed migration 20250829190446_epic19_deal_tracker
-- This script manually applies the schema changes that the migration was trying to do

-- 1. Add missing enum values to DealStatus if they don't exist
DO $$
BEGIN
  -- Add OPEN value if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid=t.oid
    WHERE t.typname='DealStatus' AND e.enumlabel='OPEN'
  ) THEN
    ALTER TYPE "public"."DealStatus" ADD VALUE 'OPEN';
  END IF;
  
  -- Add COUNTERED value if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid=t.oid
    WHERE t.typname='DealStatus' AND e.enumlabel='COUNTERED'
  ) THEN
    ALTER TYPE "public"."DealStatus" ADD VALUE 'COUNTERED';
  END IF;
  
  -- Add WON value if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid=t.oid
    WHERE t.typname='DealStatus' AND e.enumlabel='WON'
  ) THEN
    ALTER TYPE "public"."DealStatus" ADD VALUE 'WON';
  END IF;
  
  -- Add LOST value if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid=t.oid
    WHERE t.typname='DealStatus' AND e.enumlabel='LOST'
  ) THEN
    ALTER TYPE "public"."DealStatus" ADD VALUE 'LOST';
  END IF;
END$$;

-- 2. Create AdminRole enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminRole') THEN
    CREATE TYPE "public"."AdminRole" AS ENUM ('SUPER', 'SUPPORT');
  END IF;
END$$;

-- 3. Add missing columns to Deal table if they don't exist
DO $$
BEGIN
  -- Add category column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Deal' AND column_name = 'category'
  ) THEN
    ALTER TABLE "public"."Deal" ADD COLUMN "category" TEXT;
  END IF;
  
  -- Add counterAmount column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Deal' AND column_name = 'counterAmount'
  ) THEN
    ALTER TABLE "public"."Deal" ADD COLUMN "counterAmount" INTEGER;
  END IF;
  
  -- Add creatorId column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Deal' AND column_name = 'creatorId'
  ) THEN
    ALTER TABLE "public"."Deal" ADD COLUMN "creatorId" TEXT;
  END IF;
  
  -- Add finalAmount column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Deal' AND column_name = 'finalAmount'
  ) THEN
    ALTER TABLE "public"."Deal" ADD COLUMN "finalAmount" INTEGER;
  END IF;
  
  -- Add offerAmount column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Deal' AND column_name = 'offerAmount'
  ) THEN
    ALTER TABLE "public"."Deal" ADD COLUMN "offerAmount" INTEGER NOT NULL DEFAULT 0;
  END IF;
END$$;

-- 4. Set default value for status column
ALTER TABLE "public"."Deal" ALTER COLUMN "status" SET DEFAULT 'OPEN';

-- 5. Add missing columns to AuditLog table if they don't exist
DO $$
BEGIN
  -- Add adminId column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'AuditLog' AND column_name = 'adminId'
  ) THEN
    ALTER TABLE "public"."AuditLog" ADD COLUMN "adminId" TEXT;
  END IF;
  
  -- Add ip column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'AuditLog' AND column_name = 'ip'
  ) THEN
    ALTER TABLE "public"."AuditLog" ADD COLUMN "ip" TEXT;
  END IF;
  
  -- Add traceId column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'AuditLog' AND column_name = 'traceId'
  ) THEN
    ALTER TABLE "public"."AuditLog" ADD COLUMN "traceId" TEXT;
  END IF;
  
  -- Add ua column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'AuditLog' AND column_name = 'ua'
  ) THEN
    ALTER TABLE "public"."AuditLog" ADD COLUMN "ua" TEXT;
  END IF;
END$$;

-- 6. Add missing columns to Membership table if they don't exist
DO $$
BEGIN
  -- Add invitedById column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Membership' AND column_name = 'invitedById'
  ) THEN
    ALTER TABLE "public"."Membership" ADD COLUMN "invitedById" TEXT;
  END IF;
END$$;

-- 7. Create missing tables if they don't exist
DO $$
BEGIN
  -- Create Admin table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Admin') THEN
    CREATE TABLE "public"."Admin" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "role" "public"."AdminRole" NOT NULL DEFAULT 'SUPPORT',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
    );
    CREATE UNIQUE INDEX "Admin_email_key" ON "public"."Admin"("email");
  END IF;
  
  -- Create ImpersonationSession table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ImpersonationSession') THEN
    CREATE TABLE "public"."ImpersonationSession" (
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
    CREATE INDEX "ImpersonationSession_workspaceId_active_idx" ON "public"."ImpersonationSession"("workspaceId", "active");
  END IF;
  
  -- Create RunStepExecution table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'RunStepExecution') THEN
    CREATE TABLE "public"."RunStepExecution" (
        "id" TEXT NOT NULL,
        "runId" TEXT NOT NULL,
        "step" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "inputJson" JSONB NOT NULL,
        "outputJson" JSONB,
        "errorJson" JSONB,
        "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "finishedAt" TIMESTAMP(3),
        "traceId" TEXT,
        "replayOfId" TEXT,
        CONSTRAINT "RunStepExecution_pkey" PRIMARY KEY ("id")
    );
    CREATE INDEX "RunStepExecution_runId_step_idx" ON "public"."RunStepExecution"("runId", "step");
    CREATE INDEX "RunStepExecution_traceId_idx" ON "public"."RunStepExecution"("traceId");
  END IF;
  
  -- Create ErrorEvent table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ErrorEvent') THEN
    CREATE TABLE "public"."ErrorEvent" (
        "id" TEXT NOT NULL,
        "workspaceId" TEXT,
        "where" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "stack" TEXT,
        "meta" JSONB,
        "traceId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ErrorEvent_pkey" PRIMARY KEY ("id")
    );
    CREATE INDEX "ErrorEvent_workspaceId_createdAt_idx" ON "public"."ErrorEvent"("workspaceId", "createdAt");
  END IF;
END$$;

-- 8. Add missing indexes
DO $$
BEGIN
  -- Add Deal indexes if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'Deal' AND indexname = 'Deal_workspaceId_status_idx'
  ) THEN
    CREATE INDEX "Deal_workspaceId_status_idx" ON "public"."Deal"("workspaceId", "status");
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'Deal' AND indexname = 'Deal_workspaceId_category_idx'
  ) THEN
    CREATE INDEX "Deal_workspaceId_category_idx" ON "public"."Deal"("workspaceId", "category");
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'Deal' AND indexname = 'Deal_workspaceId_createdAt_idx'
  ) THEN
    CREATE INDEX "Deal_workspaceId_createdAt_idx" ON "public"."Deal"("workspaceId", "createdAt");
  END IF;
  
  -- Add Membership index if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'Membership' AND indexname = 'Membership_invitedById_idx'
  ) THEN
    CREATE INDEX "Membership_invitedById_idx" ON "public"."Membership"("invitedById");
  END IF;
END$$;

-- 9. Mark the migration as applied in Prisma's migration table
INSERT INTO "_prisma_migrations" (
    "id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count"
) VALUES (
    '20250829190446_epic19_deal_tracker',
    'manual_fix',
    NOW(),
    '20250829190446_epic19_deal_tracker',
    '{"message": "Manually applied schema changes"}',
    NULL,
    NOW(),
    1
) ON CONFLICT (id) DO UPDATE SET
    finished_at = NOW(),
    rolled_back_at = NULL,
    applied_steps_count = 1;
