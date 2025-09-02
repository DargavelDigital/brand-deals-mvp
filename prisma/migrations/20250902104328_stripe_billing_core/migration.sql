/*
  Warnings:

  - The values [TEAM] on the enum `Plan` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."Plan_new" AS ENUM ('FREE', 'PRO', 'AGENCY');
ALTER TABLE "public"."Workspace" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "public"."Workspace" ALTER COLUMN "plan" TYPE "public"."Plan_new" USING ("plan"::text::"public"."Plan_new");
ALTER TYPE "public"."Plan" RENAME TO "Plan_old";
ALTER TYPE "public"."Plan_new" RENAME TO "Plan";
DROP TYPE "public"."Plan_old";
ALTER TABLE "public"."Workspace" ALTER COLUMN "plan" SET DEFAULT 'FREE';
COMMIT;

-- CreateIndex
CREATE INDEX "InboxThread_contactId_idx" ON "public"."InboxThread"("contactId");

-- AddForeignKey
ALTER TABLE "public"."InboxThread" ADD CONSTRAINT "InboxThread_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "public"."Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
