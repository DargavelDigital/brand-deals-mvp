-- CreateTable
CREATE TABLE "public"."BrandRun" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "auto" BOOLEAN NOT NULL DEFAULT false,
    "selectedBrandIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mediaPackId" TEXT,
    "sequenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BrandRun_workspaceId_step_idx" ON "public"."BrandRun"("workspaceId", "step");

-- AddForeignKey
ALTER TABLE "public"."BrandRun" ADD CONSTRAINT "BrandRun_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
