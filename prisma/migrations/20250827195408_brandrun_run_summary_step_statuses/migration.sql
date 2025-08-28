/*
  Warnings:

  - You are about to drop the column `mediaPackId` on the `BrandRun` table. All the data in the column will be lost.
  - You are about to drop the column `sequenceId` on the `BrandRun` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."BrandRun" DROP COLUMN "mediaPackId",
DROP COLUMN "sequenceId",
ADD COLUMN     "runSummaryJson" JSONB,
ADD COLUMN     "stepStatuses" JSONB;

-- AlterTable
ALTER TABLE "public"."Workspace" ALTER COLUMN "featureFlags" SET DATA TYPE JSONB;

-- CreateTable
CREATE TABLE "public"."BrandCandidateCache" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandCandidateCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BrandCandidateCache_workspaceId_term_idx" ON "public"."BrandCandidateCache"("workspaceId", "term");

-- CreateIndex
CREATE INDEX "BrandCandidateCache_expiresAt_idx" ON "public"."BrandCandidateCache"("expiresAt");
