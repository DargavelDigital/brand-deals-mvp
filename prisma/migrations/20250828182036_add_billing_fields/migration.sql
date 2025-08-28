/*
  Warnings:

  - You are about to drop the column `amount` on the `CreditLedger` table. All the data will be lost.
  - You are about to drop the column `description` on the `CreditLedger` table. All the data will be lost.
  - You are about to drop the column `type` on the `CreditLedger` table. All the data will be lost.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `Workspace` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `balanceAfter` to the `CreditLedger` table without a default value. This is not possible if the table is not empty.
  - Added the required column `delta` to the `CreditLedger` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kind` to the `CreditLedger` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Plan" AS ENUM ('FREE', 'PRO', 'TEAM');

-- CreateEnum
CREATE TYPE "public"."CreditKind" AS ENUM ('AI', 'EMAIL');

-- DropForeignKey
ALTER TABLE "public"."CreditLedger" DROP CONSTRAINT "CreditLedger_workspaceId_fkey";

-- AlterTable
ALTER TABLE "public"."CreditLedger" DROP COLUMN "amount",
DROP COLUMN "description",
DROP COLUMN "type",
ADD COLUMN     "balanceAfter" INTEGER NOT NULL,
ADD COLUMN     "delta" INTEGER NOT NULL,
ADD COLUMN     "kind" "public"."CreditKind" NOT NULL,
ADD COLUMN     "reason" TEXT,
ADD COLUMN     "ref" TEXT;

-- AlterTable
ALTER TABLE "public"."Workspace" ADD COLUMN     "aiTokensBalance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "emailBalance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "emailDailyUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "periodEnd" TIMESTAMP(3),
ADD COLUMN     "periodStart" TIMESTAMP(3),
ADD COLUMN     "plan" "public"."Plan" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubId" TEXT;

-- DropEnum
DROP TYPE "public"."CreditType";

-- CreateIndex
CREATE INDEX "CreditLedger_workspaceId_createdAt_idx" ON "public"."CreditLedger"("workspaceId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_stripeCustomerId_key" ON "public"."Workspace"("stripeCustomerId");

-- AddForeignKey
ALTER TABLE "public"."CreditLedger" ADD CONSTRAINT "CreditLedger_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
