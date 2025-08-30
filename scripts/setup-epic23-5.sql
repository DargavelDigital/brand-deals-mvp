-- Epic 23.5: Human-in-the-loop Feedback
-- Add AI feedback system and update evaluation results

-- Create FeedbackType enum
DO $$ BEGIN
    CREATE TYPE "public"."FeedbackType" AS ENUM ('MATCH', 'OUTREACH', 'AUDIT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Decision enum
DO $$ BEGIN
    CREATE TYPE "public"."Decision" AS ENUM ('UP', 'DOWN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create AiFeedback table
CREATE TABLE IF NOT EXISTS "public"."AiFeedback" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."FeedbackType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "decision" "public"."Decision" NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiFeedback_pkey" PRIMARY KEY ("id")
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "AiFeedback_workspaceId_type_targetId_idx" ON "public"."AiFeedback"("workspaceId", "type", "targetId");
CREATE INDEX IF NOT EXISTS "AiFeedback_workspaceId_type_createdAt_idx" ON "public"."AiFeedback"("workspaceId", "type", "createdAt");
CREATE INDEX IF NOT EXISTS "AiFeedback_userId_createdAt_idx" ON "public"."AiFeedback"("userId", "createdAt");

-- Add userApprovalRate column to EvalResult if it doesn't exist
DO $$ BEGIN
    ALTER TABLE "public"."EvalResult" ADD COLUMN "userApprovalRate" DOUBLE PRECISION DEFAULT 0;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Insert sample feedback for testing
INSERT INTO "public"."AiFeedback" (
    "id", "workspaceId", "userId", "type", "targetId", "decision", "comment"
) VALUES 
    ('feedback_sample_001', 'cmey5e6u100012gyg1tav9ztb', 'cmey5e6tn00002gyg2c491btl', 'MATCH', 'brand_gymshark', 'UP', 'Great fitness brand match!'),
    ('feedback_sample_002', 'cmey5e6u100012gyg1tav9ztb', 'cmey5e6tn00002gyg2c491btl', 'MATCH', 'brand_patagonia', 'UP', 'Perfect for sustainable audience'),
    ('feedback_sample_003', 'cmey5e6u100012gyg1tav9ztb', 'cmey5e6tn00002gyg2c491btl', 'OUTREACH', 'email_001', 'DOWN', 'Tone too formal for this audience')
ON CONFLICT ("id") DO NOTHING;

-- Update existing EvalResult rows with sample user approval rate
UPDATE "public"."EvalResult" 
SET "userApprovalRate" = 0.75 
WHERE "userApprovalRate" = 0 OR "userApprovalRate" IS NULL;

-- Verify table creation
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('AiFeedback', 'EvalResult')
ORDER BY table_name, ordinal_position;

-- Show sample data
SELECT 
    'AiFeedback' as table_name,
    COUNT(*) as record_count
FROM "public"."AiFeedback"
UNION ALL
SELECT 
    'EvalResult' as table_name,
    COUNT(*) as record_count
FROM "public"."EvalResult";
