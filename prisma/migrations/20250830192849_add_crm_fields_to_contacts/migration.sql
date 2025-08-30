-- CreateEnum
CREATE TYPE "public"."SafetyVerdict" AS ENUM ('PASS', 'WARN', 'BLOCK');

-- CreateEnum
CREATE TYPE "public"."ExportStatus" AS ENUM ('QUEUED', 'RUNNING', 'DONE', 'FAILED');

-- AlterTable
ALTER TABLE "public"."Contact" ADD COLUMN     "nextStep" TEXT,
ADD COLUMN     "remindAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."AdminActionLog" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "traceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContentSafetyCheck" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "sequenceStepId" TEXT,
    "subject" TEXT,
    "bodyHash" TEXT NOT NULL,
    "verdict" "public"."SafetyVerdict" NOT NULL,
    "reasons" TEXT[],
    "model" TEXT,
    "tokens" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentSafetyCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExportJob" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" "public"."ExportStatus" NOT NULL DEFAULT 'QUEUED',
    "requestedBy" TEXT,
    "resultUrl" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ExportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RetentionPolicy" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "auditsDays" INTEGER,
    "outreachDays" INTEGER,
    "logsDays" INTEGER,
    "contactsDays" INTEGER,
    "mediaPacksDays" INTEGER,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetentionPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SignalEvent" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "domainHash" TEXT,
    "industry" TEXT,
    "sizeBand" TEXT,
    "region" TEXT,
    "season" TEXT,
    "channel" TEXT,
    "sendDow" INTEGER,
    "sendHour" INTEGER,
    "templateFamily" TEXT,
    "tone" TEXT,
    "stepsPlanned" INTEGER,
    "replied" BOOLEAN NOT NULL DEFAULT false,
    "won" BOOLEAN NOT NULL DEFAULT false,
    "valueUsd" DOUBLE PRECISION,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "outcomeAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignalEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SignalAggregate" (
    "id" TEXT NOT NULL,
    "industry" TEXT,
    "sizeBand" TEXT,
    "region" TEXT,
    "season" TEXT,
    "tone" TEXT,
    "templateFamily" TEXT,
    "sendDow" INTEGER,
    "sendHour" INTEGER,
    "sends" INTEGER NOT NULL DEFAULT 0,
    "replies" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "revenueUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dpEpsilon" DOUBLE PRECISION,
    "kmin" INTEGER NOT NULL DEFAULT 10,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignalAggregate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BrandReadinessSignal" (
    "id" TEXT NOT NULL,
    "industry" TEXT,
    "sizeBand" TEXT,
    "region" TEXT,
    "score" INTEGER NOT NULL,
    "components" JSONB NOT NULL,
    "source" TEXT NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrandReadinessSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Playbook" (
    "id" TEXT NOT NULL,
    "industry" TEXT,
    "sizeBand" TEXT,
    "region" TEXT,
    "season" TEXT,
    "payload" JSONB NOT NULL,
    "rationale" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "derivedFromAggAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Playbook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminActionLog_workspaceId_createdAt_idx" ON "public"."AdminActionLog"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "ContentSafetyCheck_workspaceId_createdAt_verdict_idx" ON "public"."ContentSafetyCheck"("workspaceId", "createdAt", "verdict");

-- CreateIndex
CREATE INDEX "ExportJob_workspaceId_status_createdAt_idx" ON "public"."ExportJob"("workspaceId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RetentionPolicy_workspaceId_key" ON "public"."RetentionPolicy"("workspaceId");

-- CreateIndex
CREATE INDEX "SignalEvent_industry_sizeBand_region_season_tone_templateFa_idx" ON "public"."SignalEvent"("industry", "sizeBand", "region", "season", "tone", "templateFamily", "sendDow", "sendHour");

-- CreateIndex
CREATE INDEX "SignalEvent_workspaceId_createdAt_idx" ON "public"."SignalEvent"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "SignalAggregate_industry_sizeBand_region_season_tone_templa_idx" ON "public"."SignalAggregate"("industry", "sizeBand", "region", "season", "tone", "templateFamily", "sendDow", "sendHour");

-- CreateIndex
CREATE INDEX "BrandReadinessSignal_industry_sizeBand_region_computedAt_idx" ON "public"."BrandReadinessSignal"("industry", "sizeBand", "region", "computedAt");

-- CreateIndex
CREATE INDEX "Playbook_industry_sizeBand_region_season_version_idx" ON "public"."Playbook"("industry", "sizeBand", "region", "season", "version");

-- AddForeignKey
ALTER TABLE "public"."AdminActionLog" ADD CONSTRAINT "AdminActionLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentSafetyCheck" ADD CONSTRAINT "ContentSafetyCheck_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExportJob" ADD CONSTRAINT "ExportJob_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RetentionPolicy" ADD CONSTRAINT "RetentionPolicy_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SignalEvent" ADD CONSTRAINT "SignalEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
