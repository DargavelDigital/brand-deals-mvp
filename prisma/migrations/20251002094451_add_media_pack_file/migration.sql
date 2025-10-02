-- CreateTable
CREATE TABLE "public"."MediaPackTracking" (
    "id" TEXT NOT NULL,
    "mediaPackId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "cta" TEXT,
    "durationMs" INTEGER,
    "referer" TEXT,
    "userAgent" TEXT,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaPackTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SocialAccount" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "username" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MediaPackTracking_mediaPackId_event_idx" ON "public"."MediaPackTracking"("mediaPackId", "event");

-- CreateIndex
CREATE INDEX "MediaPackTracking_createdAt_idx" ON "public"."MediaPackTracking"("createdAt");

-- CreateIndex
CREATE INDEX "SocialAccount_workspaceId_idx" ON "public"."SocialAccount"("workspaceId");

-- CreateIndex
CREATE INDEX "SocialAccount_platform_idx" ON "public"."SocialAccount"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_workspaceId_platform_key" ON "public"."SocialAccount"("workspaceId", "platform");

-- AddForeignKey
ALTER TABLE "public"."MediaPackTracking" ADD CONSTRAINT "MediaPackTracking_mediaPackId_fkey" FOREIGN KEY ("mediaPackId") REFERENCES "public"."MediaPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SocialAccount" ADD CONSTRAINT "SocialAccount_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
