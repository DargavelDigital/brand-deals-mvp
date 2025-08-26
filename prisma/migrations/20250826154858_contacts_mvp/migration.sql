-- CreateEnum
CREATE TYPE "public"."ContactVerificationStatus" AS ENUM ('UNVERIFIED', 'VALID', 'RISKY', 'INVALID');

-- CreateEnum
CREATE TYPE "public"."ContactStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "public"."Contact" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "brandId" TEXT,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "seniority" TEXT,
    "verifiedStatus" "public"."ContactVerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "score" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "lastContacted" TIMESTAMP(3),
    "status" "public"."ContactStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Contact_workspaceId_brandId_idx" ON "public"."Contact"("workspaceId", "brandId");

-- CreateIndex
CREATE INDEX "Contact_workspaceId_status_idx" ON "public"."Contact"("workspaceId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_workspaceId_email_key" ON "public"."Contact"("workspaceId", "email");

-- AddForeignKey
ALTER TABLE "public"."Contact" ADD CONSTRAINT "Contact_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Contact" ADD CONSTRAINT "Contact_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
