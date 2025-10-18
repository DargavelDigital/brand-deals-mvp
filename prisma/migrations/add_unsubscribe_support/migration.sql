-- Add unsubscribed field to Contact model
ALTER TABLE "Contact" ADD COLUMN "unsubscribed" BOOLEAN NOT NULL DEFAULT false;

-- Create UnsubscribeToken table
CREATE TABLE "UnsubscribeToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnsubscribeToken_pkey" PRIMARY KEY ("id")
);

-- Create unique index on token
CREATE UNIQUE INDEX "UnsubscribeToken_token_key" ON "UnsubscribeToken"("token");

-- Create indexes for performance
CREATE INDEX "UnsubscribeToken_token_idx" ON "UnsubscribeToken"("token");
CREATE INDEX "UnsubscribeToken_email_idx" ON "UnsubscribeToken"("email");
CREATE INDEX "UnsubscribeToken_workspaceId_idx" ON "UnsubscribeToken"("workspaceId");

