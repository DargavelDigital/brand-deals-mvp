/*
  Warnings:

  - You are about to drop the column `status` on the `MediaPackConversion` table. All the data in the column will be lost.
  - You are about to drop the column `traceId` on the `MediaPackConversion` table. All the data in the column will be lost.
  - You are about to drop the column `event` on the `MediaPackView` table. All the data in the column will be lost.
  - You are about to drop the column `traceId` on the `MediaPackView` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `MediaPackView` table. All the data in the column will be lost.
  - Added the required column `sessionId` to the `MediaPackConversion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variant` to the `MediaPackConversion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `visitorId` to the `MediaPackConversion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `MediaPackConversion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionId` to the `MediaPackView` table without a default value. This is not possible if the table is not empty.
  - Added the required column `visitorId` to the `MediaPackView` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `MediaPackView` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."MediaPackConversion_createdAt_idx";

-- DropIndex
DROP INDEX "public"."MediaPackConversion_mediaPackId_idx";

-- DropIndex
DROP INDEX "public"."MediaPackConversion_status_idx";

-- DropIndex
DROP INDEX "public"."MediaPackView_createdAt_idx";

-- DropIndex
DROP INDEX "public"."MediaPackView_mediaPackId_idx";

-- AlterTable
ALTER TABLE "public"."MediaPack" ADD COLUMN     "brandId" TEXT,
ADD COLUMN     "sequenceId" TEXT;

-- AlterTable
ALTER TABLE "public"."MediaPackConversion" DROP COLUMN "status",
DROP COLUMN "traceId",
ADD COLUMN     "contactId" TEXT,
ADD COLUMN     "sequenceId" TEXT,
ADD COLUMN     "sessionId" TEXT,
ADD COLUMN     "stepId" TEXT,
ADD COLUMN     "value" DOUBLE PRECISION,
ADD COLUMN     "variant" TEXT,
ADD COLUMN     "visitorId" TEXT,
ADD COLUMN     "workspaceId" TEXT;

-- Update existing MediaPackConversion records with default values
UPDATE "public"."MediaPackConversion" 
SET "sessionId" = 'legacy-' || id,
    "visitorId" = 'legacy-' || id,
    "variant" = 'classic',
    "workspaceId" = (SELECT "workspaceId" FROM "public"."MediaPack" WHERE "id" = "mediaPackId");

-- Make columns NOT NULL after updating
ALTER TABLE "public"."MediaPackConversion" ALTER COLUMN "sessionId" SET NOT NULL;
ALTER TABLE "public"."MediaPackConversion" ALTER COLUMN "visitorId" SET NOT NULL;
ALTER TABLE "public"."MediaPackConversion" ALTER COLUMN "variant" SET NOT NULL;
ALTER TABLE "public"."MediaPackConversion" ALTER COLUMN "workspaceId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."MediaPackView" DROP COLUMN "event",
DROP COLUMN "traceId",
DROP COLUMN "value",
ADD COLUMN     "brandId" TEXT,
ADD COLUMN     "contactId" TEXT,
ADD COLUMN     "dwellMs" INTEGER,
ADD COLUMN     "ipHash" TEXT,
ADD COLUMN     "referrer" TEXT,
ADD COLUMN     "scrollDepth" INTEGER,
ADD COLUMN     "sequenceId" TEXT,
ADD COLUMN     "sessionId" TEXT,
ADD COLUMN     "stepId" TEXT,
ADD COLUMN     "ua" TEXT,
ADD COLUMN     "utmCampaign" TEXT,
ADD COLUMN     "utmMedium" TEXT,
ADD COLUMN     "utmSource" TEXT,
ADD COLUMN     "visitorId" TEXT,
ADD COLUMN     "workspaceId" TEXT;

-- Update existing MediaPackView records with default values
UPDATE "public"."MediaPackView" 
SET "sessionId" = 'legacy-' || id,
    "visitorId" = 'legacy-' || id,
    "workspaceId" = (SELECT "workspaceId" FROM "public"."MediaPack" WHERE "id" = "mediaPackId");

-- Make columns NOT NULL after updating
ALTER TABLE "public"."MediaPackView" ALTER COLUMN "sessionId" SET NOT NULL;
ALTER TABLE "public"."MediaPackView" ALTER COLUMN "visitorId" SET NOT NULL;
ALTER TABLE "public"."MediaPackView" ALTER COLUMN "workspaceId" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."MediaPackClick" (
    "id" TEXT NOT NULL,
    "mediaPackId" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "ctaId" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "sequenceId" TEXT,
    "brandId" TEXT,
    "stepId" TEXT,
    "contactId" TEXT,
    "visitorId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaPackClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MediaPackDaily" (
    "id" TEXT NOT NULL,
    "mediaPackId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "variant" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cvr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaPackDaily_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MediaPackClick_mediaPackId_createdAt_idx" ON "public"."MediaPackClick"("mediaPackId", "createdAt");

-- CreateIndex
CREATE INDEX "MediaPackClick_workspaceId_createdAt_idx" ON "public"."MediaPackClick"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "MediaPackClick_variant_idx" ON "public"."MediaPackClick"("variant");

-- CreateIndex
CREATE INDEX "MediaPackDaily_mediaPackId_date_idx" ON "public"."MediaPackDaily"("mediaPackId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "MediaPackDaily_mediaPackId_date_variant_key" ON "public"."MediaPackDaily"("mediaPackId", "date", "variant");

-- CreateIndex
CREATE INDEX "MediaPack_brandId_idx" ON "public"."MediaPack"("brandId");

-- CreateIndex
CREATE INDEX "MediaPack_sequenceId_idx" ON "public"."MediaPack"("sequenceId");

-- CreateIndex
CREATE INDEX "MediaPackConversion_mediaPackId_createdAt_idx" ON "public"."MediaPackConversion"("mediaPackId", "createdAt");

-- CreateIndex
CREATE INDEX "MediaPackConversion_workspaceId_createdAt_idx" ON "public"."MediaPackConversion"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "MediaPackView_mediaPackId_createdAt_idx" ON "public"."MediaPackView"("mediaPackId", "createdAt");

-- CreateIndex
CREATE INDEX "MediaPackView_workspaceId_createdAt_idx" ON "public"."MediaPackView"("workspaceId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."MediaPackClick" ADD CONSTRAINT "MediaPackClick_mediaPackId_fkey" FOREIGN KEY ("mediaPackId") REFERENCES "public"."MediaPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MediaPackDaily" ADD CONSTRAINT "MediaPackDaily_mediaPackId_fkey" FOREIGN KEY ("mediaPackId") REFERENCES "public"."MediaPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
