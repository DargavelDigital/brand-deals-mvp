-- CreateEnum
CREATE TYPE "public"."ThreadStatus" AS ENUM ('OPEN', 'WAITING', 'WON', 'LOST', 'CLOSED');

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "payload" JSONB,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DigestPreference" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "cadence" TEXT NOT NULL,
    "hourOfDay" INTEGER NOT NULL DEFAULT 9,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DigestPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InboxThread" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "sequenceId" TEXT,
    "contactId" TEXT NOT NULL,
    "brandId" TEXT,
    "subject" TEXT NOT NULL,
    "status" "public"."ThreadStatus" NOT NULL DEFAULT 'OPEN',
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InboxThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InboxMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "toEmail" TEXT NOT NULL,
    "externalId" TEXT,
    "subject" TEXT,
    "text" TEXT,
    "html" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InboxMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_workspaceId_createdAt_idx" ON "public"."Notification"("workspaceId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DigestPreference_workspaceId_key" ON "public"."DigestPreference"("workspaceId");

-- CreateIndex
CREATE INDEX "InboxThread_workspaceId_lastMessageAt_idx" ON "public"."InboxThread"("workspaceId", "lastMessageAt");

-- CreateIndex
CREATE INDEX "InboxThread_sequenceId_idx" ON "public"."InboxThread"("sequenceId");

-- CreateIndex
CREATE INDEX "InboxMessage_threadId_createdAt_idx" ON "public"."InboxMessage"("threadId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InboxThread" ADD CONSTRAINT "InboxThread_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InboxMessage" ADD CONSTRAINT "InboxMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "public"."InboxThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
