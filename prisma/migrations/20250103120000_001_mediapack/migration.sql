-- CreateTable
CREATE TABLE "MediaPack" (
    "id" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "payload" JSONB,
    "theme" JSONB,
    "contentHash" TEXT,
    "shareToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaPackFile" (
    "id" TEXT NOT NULL,
    "packIdRef" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaPackFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaPack_packId_key" ON "MediaPack"("packId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaPack_shareToken_key" ON "MediaPack"("shareToken");

-- CreateIndex
CREATE INDEX "MediaPackFile_packIdRef_idx" ON "MediaPackFile"("packIdRef");

-- CreateIndex
CREATE INDEX "MediaPackFile_variant_createdAt_idx" ON "MediaPackFile"("variant", "createdAt");

-- AddForeignKey
ALTER TABLE "MediaPackFile" ADD CONSTRAINT "MediaPackFile_packIdRef_fkey" FOREIGN KEY ("packIdRef") REFERENCES "MediaPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
