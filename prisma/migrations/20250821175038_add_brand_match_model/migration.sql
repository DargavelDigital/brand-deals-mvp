-- CreateTable
CREATE TABLE "public"."BrandMatch" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "reasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrandMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BrandMatch_workspaceId_score_idx" ON "public"."BrandMatch"("workspaceId", "score");

-- CreateIndex
CREATE UNIQUE INDEX "BrandMatch_workspaceId_brandId_key" ON "public"."BrandMatch"("workspaceId", "brandId");

-- AddForeignKey
ALTER TABLE "public"."BrandMatch" ADD CONSTRAINT "BrandMatch_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BrandMatch" ADD CONSTRAINT "BrandMatch_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
