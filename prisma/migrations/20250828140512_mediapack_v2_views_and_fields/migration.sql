-- AlterTable
ALTER TABLE "public"."MediaPack" ADD COLUMN     "brandIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "shareToken" TEXT,
ADD COLUMN     "theme" JSONB,
ALTER COLUMN "variant" SET DEFAULT 'classic';

-- CreateTable
CREATE TABLE "public"."MediaPackView" (
    "id" TEXT NOT NULL,
    "mediaPackId" TEXT NOT NULL,
    "traceId" TEXT NOT NULL,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dwellMs" INTEGER,

    CONSTRAINT "MediaPackView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MediaPackView_mediaPackId_idx" ON "public"."MediaPackView"("mediaPackId");

-- CreateIndex
CREATE INDEX "MediaPackView_openedAt_idx" ON "public"."MediaPackView"("openedAt");

-- AddForeignKey
ALTER TABLE "public"."MediaPackView" ADD CONSTRAINT "MediaPackView_mediaPackId_fkey" FOREIGN KEY ("mediaPackId") REFERENCES "public"."MediaPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
