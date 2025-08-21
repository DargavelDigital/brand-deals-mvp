-- CreateTable
CREATE TABLE "public"."MediaPack" (
    "id" TEXT NOT NULL,
    "variant" TEXT NOT NULL DEFAULT 'default',
    "htmlUrl" TEXT,
    "pdfUrl" TEXT,
    "workspaceId" TEXT NOT NULL,
    "creatorId" TEXT,
    "demo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaPack_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MediaPack_workspaceId_variant_idx" ON "public"."MediaPack"("workspaceId", "variant");

-- AddForeignKey
ALTER TABLE "public"."MediaPack" ADD CONSTRAINT "MediaPack_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
