/*
  Warnings:

  - You are about to drop the column `createdAt` on the `BrandCandidateCache` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `BrandCandidateCache` table. All the data in the column will be lost.
  - You are about to drop the column `dwellMs` on the `MediaPackView` table. All the data in the column will be lost.
  - You are about to drop the column `ipHash` on the `MediaPackView` table. All the data in the column will be lost.
  - You are about to drop the column `openedAt` on the `MediaPackView` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `MediaPackView` table. All the data in the column will be lost.
  - Added the required column `refreshedAt` to the `BrandCandidateCache` table without a default value. This is not possible if the table is not empty.
  - Added the required column `event` to the `MediaPackView` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variant` to the `MediaPackView` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ImportKind" AS ENUM ('BRAND', 'CONTACT', 'DEAL');

-- CreateEnum
CREATE TYPE "public"."ImportSource" AS ENUM ('CSV', 'GSHEETS');

-- CreateEnum
CREATE TYPE "public"."ImportStatus" AS ENUM ('RECEIVED', 'MAPPING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELED');

-- DropIndex
DROP INDEX "public"."MediaPackView_openedAt_idx";

-- AlterTable
ALTER TABLE "public"."BrandCandidateCache" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "domain" TEXT,
ADD COLUMN     "refreshedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "term" DROP NOT NULL,
ALTER COLUMN "expiresAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."MediaPackView" DROP COLUMN "dwellMs",
DROP COLUMN "ipHash",
DROP COLUMN "openedAt",
DROP COLUMN "userAgent",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "event" TEXT NOT NULL,
ADD COLUMN     "value" INTEGER,
ADD COLUMN     "variant" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."MediaPackConversion" (
    "id" TEXT NOT NULL,
    "mediaPackId" TEXT NOT NULL,
    "brandId" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "traceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaPackConversion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ImportJob" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "kind" "public"."ImportKind" NOT NULL,
    "source" "public"."ImportSource" NOT NULL,
    "status" "public"."ImportStatus" NOT NULL DEFAULT 'RECEIVED',
    "fileUrl" TEXT,
    "sheetId" TEXT,
    "sheetRange" TEXT,
    "totalRows" INTEGER,
    "processed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "summaryJson" JSONB,

    CONSTRAINT "ImportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DedupeFingerprint" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DedupeFingerprint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MediaPackConversion_mediaPackId_idx" ON "public"."MediaPackConversion"("mediaPackId");

-- CreateIndex
CREATE INDEX "MediaPackConversion_createdAt_idx" ON "public"."MediaPackConversion"("createdAt");

-- CreateIndex
CREATE INDEX "MediaPackConversion_type_idx" ON "public"."MediaPackConversion"("type");

-- CreateIndex
CREATE INDEX "MediaPackConversion_status_idx" ON "public"."MediaPackConversion"("status");

-- CreateIndex
CREATE INDEX "ImportJob_workspaceId_kind_status_idx" ON "public"."ImportJob"("workspaceId", "kind", "status");

-- CreateIndex
CREATE INDEX "DedupeFingerprint_workspaceId_entity_idx" ON "public"."DedupeFingerprint"("workspaceId", "entity");

-- CreateIndex
CREATE UNIQUE INDEX "DedupeFingerprint_workspaceId_entity_key_key" ON "public"."DedupeFingerprint"("workspaceId", "entity", "key");

-- CreateIndex
CREATE INDEX "BrandCandidateCache_workspaceId_domain_idx" ON "public"."BrandCandidateCache"("workspaceId", "domain");

-- CreateIndex
CREATE INDEX "BrandCandidateCache_workspaceId_discoveredAt_idx" ON "public"."BrandCandidateCache"("workspaceId", "discoveredAt");

-- CreateIndex
CREATE INDEX "MediaPackView_createdAt_idx" ON "public"."MediaPackView"("createdAt");

-- CreateIndex
CREATE INDEX "MediaPackView_variant_idx" ON "public"."MediaPackView"("variant");

-- AddForeignKey
ALTER TABLE "public"."MediaPackConversion" ADD CONSTRAINT "MediaPackConversion_mediaPackId_fkey" FOREIGN KEY ("mediaPackId") REFERENCES "public"."MediaPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImportJob" ADD CONSTRAINT "ImportJob_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
