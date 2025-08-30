/*
  Warnings:

  - Added the required column `offerAmount` to the `Deal` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminRole') THEN
    CREATE TYPE "public"."AdminRole" AS ENUM ('SUPER', 'SUPPORT');
  END IF;

  -- Ensure all expected labels exist (safe-guard; each IF prevents duplicate errors)
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid=t.oid
    WHERE t.typname='AdminRole' AND e.enumlabel='SUPER'
  ) THEN
    ALTER TYPE "public"."AdminRole" ADD VALUE 'SUPER';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid=t.oid
    WHERE t.typname='AdminRole' AND e.enumlabel='SUPPORT'
  ) THEN
    ALTER TYPE "public"."AdminRole" ADD VALUE 'SUPPORT';
  END IF;
END$$;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.

-- Add enum values in separate transactions to avoid PostgreSQL limitation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid=t.oid
    WHERE t.typname='DealStatus' AND e.enumlabel='OPEN'
  ) THEN
    ALTER TYPE "public"."DealStatus" ADD VALUE 'OPEN';
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid=t.oid
    WHERE t.typname='DealStatus' AND e.enumlabel='COUNTERED'
  ) THEN
    ALTER TYPE "public"."DealStatus" ADD VALUE 'COUNTERED';
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid=t.oid
    WHERE t.typname='DealStatus' AND e.enumlabel='WON'
  ) THEN
    ALTER TYPE "public"."DealStatus" ADD VALUE 'WON';
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid=t.oid
    WHERE t.typname='DealStatus' AND e.enumlabel='LOST'
  ) THEN
    ALTER TYPE "public"."DealStatus" ADD VALUE 'LOST';
  END IF;
END$$;

-- AlterTable
ALTER TABLE "public"."AuditLog" ADD COLUMN     "adminId" TEXT,
ADD COLUMN     "ip" TEXT,
ADD COLUMN     "traceId" TEXT,
ADD COLUMN     "ua" TEXT;

-- AlterTable
ALTER TABLE "public"."Deal" ADD COLUMN     "category" TEXT,
ADD COLUMN     "counterAmount" INTEGER,
ADD COLUMN     "creatorId" TEXT,
ADD COLUMN     "finalAmount" INTEGER,
ADD COLUMN     "offerAmount" INTEGER NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'OPEN';

-- CreateTable
CREATE TABLE "public"."Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "public"."AdminRole" NOT NULL DEFAULT 'SUPPORT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "public"."Admin"("email");

-- CreateIndex
CREATE INDEX "ImpersonationSession_workspaceId_active_idx" ON "public"."ImpersonationSession"("workspaceId", "active");

-- CreateIndex
CREATE INDEX "RunStepExecution_runId_step_idx" ON "public"."RunStepExecution"("runId", "step");

-- CreateIndex
CREATE INDEX "RunStepExecution_traceId_idx" ON "public"."RunStepExecution"("traceId");

-- CreateIndex
CREATE INDEX "ErrorEvent_workspaceId_createdAt_idx" ON "public"."ErrorEvent"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "Deal_workspaceId_status_idx" ON "public"."Deal"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Deal_workspaceId_category_idx" ON "public"."Deal"("workspaceId", "category");

-- CreateIndex
CREATE INDEX "Deal_workspaceId_createdAt_idx" ON "public"."Deal"("workspaceId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImpersonationSession" ADD CONSTRAINT "ImpersonationSession_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImpersonationSession" ADD CONSTRAINT "ImpersonationSession_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RunStepExecution" ADD CONSTRAINT "RunStepExecution_runId_fkey" FOREIGN KEY ("runId") REFERENCES "public"."BrandRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RunStepExecution" ADD CONSTRAINT "RunStepExecution_replayOfId_fkey" FOREIGN KEY ("replayOfId") REFERENCES "public"."RunStepExecution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ErrorEvent" ADD CONSTRAINT "ErrorEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
