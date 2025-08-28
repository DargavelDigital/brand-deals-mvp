-- CreateTable
CREATE TABLE "public"."AiUsageEvent" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "traceId" TEXT NOT NULL,
    "packKey" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "inputCostUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "outputCostUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCostUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dryRun" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiUsageEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiUsageEvent_workspaceId_createdAt_idx" ON "public"."AiUsageEvent"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "AiUsageEvent_traceId_idx" ON "public"."AiUsageEvent"("traceId");

-- AddForeignKey
ALTER TABLE "public"."AiUsageEvent" ADD CONSTRAINT "AiUsageEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
