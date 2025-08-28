-- CreateEnum
CREATE TYPE "public"."SequenceStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."StepStatus" AS ENUM ('PENDING', 'SENT', 'OPENED', 'CLICKED', 'REPLIED', 'BOUNCED', 'FAILED');

-- CreateTable
CREATE TABLE "public"."OutreachSequence" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "mediaPackId" TEXT,
    "name" TEXT NOT NULL,
    "status" "public"."SequenceStatus" NOT NULL DEFAULT 'DRAFT',
    "totalSteps" INTEGER NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "settings" JSONB NOT NULL,
    "tone" TEXT,
    "fromEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutreachSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SequenceStep" (
    "id" TEXT NOT NULL,
    "sequenceId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "public"."StepStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "repliedAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "provider" TEXT,
    "providerMsgId" TEXT,
    "threadKey" TEXT,
    "subject" TEXT,
    "html" TEXT,
    "text" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SequenceStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Conversation" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "sequenceId" TEXT,
    "brandId" TEXT,
    "contactId" TEXT NOT NULL,
    "subject" TEXT,
    "threadKey" TEXT NOT NULL,
    "lastAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "provider" TEXT,
    "providerMsgId" TEXT,
    "inReplyTo" TEXT,
    "fromAddr" TEXT,
    "toAddr" TEXT,
    "subject" TEXT,
    "text" TEXT,
    "html" TEXT,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OutreachSequence_workspaceId_status_idx" ON "public"."OutreachSequence"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "SequenceStep_sequenceId_stepNumber_idx" ON "public"."SequenceStep"("sequenceId", "stepNumber");

-- CreateIndex
CREATE INDEX "SequenceStep_contactId_idx" ON "public"."SequenceStep"("contactId");

-- CreateIndex
CREATE INDEX "SequenceStep_scheduledAt_idx" ON "public"."SequenceStep"("scheduledAt");

-- CreateIndex
CREATE INDEX "SequenceStep_status_idx" ON "public"."SequenceStep"("status");

-- CreateIndex
CREATE INDEX "SequenceStep_providerMsgId_idx" ON "public"."SequenceStep"("providerMsgId");

-- CreateIndex
CREATE INDEX "SequenceStep_threadKey_idx" ON "public"."SequenceStep"("threadKey");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_threadKey_key" ON "public"."Conversation"("threadKey");

-- CreateIndex
CREATE INDEX "Conversation_workspaceId_idx" ON "public"."Conversation"("workspaceId");

-- CreateIndex
CREATE INDEX "Conversation_sequenceId_idx" ON "public"."Conversation"("sequenceId");

-- CreateIndex
CREATE INDEX "Conversation_contactId_idx" ON "public"."Conversation"("contactId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "public"."Message"("conversationId");

-- CreateIndex
CREATE INDEX "Message_providerMsgId_idx" ON "public"."Message"("providerMsgId");

-- AddForeignKey
ALTER TABLE "public"."OutreachSequence" ADD CONSTRAINT "OutreachSequence_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OutreachSequence" ADD CONSTRAINT "OutreachSequence_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OutreachSequence" ADD CONSTRAINT "OutreachSequence_mediaPackId_fkey" FOREIGN KEY ("mediaPackId") REFERENCES "public"."MediaPack"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SequenceStep" ADD CONSTRAINT "SequenceStep_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "public"."OutreachSequence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SequenceStep" ADD CONSTRAINT "SequenceStep_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "public"."Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "public"."OutreachSequence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "public"."Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
