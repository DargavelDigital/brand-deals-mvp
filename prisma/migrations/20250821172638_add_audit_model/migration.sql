-- CreateTable
CREATE TABLE "public"."Audit" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "sources" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "snapshotJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Audit_workspaceId_createdAt_idx" ON "public"."Audit"("workspaceId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."Audit" ADD CONSTRAINT "Audit_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
