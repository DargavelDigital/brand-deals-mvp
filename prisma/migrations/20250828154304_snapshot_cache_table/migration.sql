-- AlterTable
ALTER TABLE "public"."Audit" ALTER COLUMN "snapshotJson" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."SocialSnapshotCache" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialSnapshotCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocialSnapshotCache_workspaceId_platform_externalId_idx" ON "public"."SocialSnapshotCache"("workspaceId", "platform", "externalId");

-- CreateIndex
CREATE INDEX "SocialSnapshotCache_expiresAt_idx" ON "public"."SocialSnapshotCache"("expiresAt");
