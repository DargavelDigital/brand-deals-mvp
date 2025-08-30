-- Epic 23.5: AI Auto-Adaptation from Feedback
-- This script sets up the complete database infrastructure for the adaptation system

-- 1. Ensure AiFeedback table exists (from previous Epic 23.5)
DO $$ BEGIN
    CREATE TYPE "public"."FeedbackType" AS ENUM ('MATCH', 'OUTREACH', 'AUDIT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."Decision" AS ENUM ('UP', 'DOWN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

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

-- 2. Add indexes for performance
CREATE INDEX IF NOT EXISTS "AiFeedback_workspaceId_type_targetId_idx" ON "public"."AiFeedback"("workspaceId", "type", "targetId");
CREATE INDEX IF NOT EXISTS "AiFeedback_workspaceId_type_createdAt_idx" ON "public"."AiFeedback"("workspaceId", "type", "createdAt");
CREATE INDEX IF NOT EXISTS "AiFeedback_userId_createdAt_idx" ON "public"."AiFeedback"("userId", "createdAt");

-- 3. Ensure EvalResult table has userApprovalRate column
DO $$ BEGIN
    ALTER TABLE "public"."EvalResult" ADD COLUMN "userApprovalRate" DOUBLE PRECISION DEFAULT 0;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- 4. Insert sample feedback data for testing adaptation
INSERT INTO "public"."AiFeedback" (
    "id", "workspaceId", "userId", "type", "targetId", "decision", "comment"
) VALUES 
    -- Outreach feedback for tone adaptation
    ('feedback_outreach_001', 'cmey5e6u100012gyg1tav9ztb', 'cmey5e6tn00002gyg2c491btl', 'OUTREACH', 'email_professional_001', 'UP', 'Perfect professional tone for business audience'),
    ('feedback_outreach_002', 'cmey5e6u100012gyg1tav9ztb', 'cmey5e6tn00002gyg2c491btl', 'OUTREACH', 'email_casual_001', 'DOWN', 'Too casual, needs more formal language'),
    ('feedback_outreach_003', 'cmey5e6u100012gyg1tav9ztb', 'cmey5e6tn00002gyg2c491btl', 'OUTREACH', 'email_clear_001', 'UP', 'Love the clear call-to-action, very actionable'),
    ('feedback_outreach_004', 'cmey5e6u100012gyg1tav9ztb', 'cmey5e6tn00002gyg2c491btl', 'OUTREACH', 'email_fluffy_001', 'DOWN', 'Too much fluff, get to the point faster'),
    
    -- Match feedback for category and geo adaptation
    ('feedback_match_001', 'cmey5e6u100012gyg1tav9ztb', 'cmey5e6tn00002gyg2c491btl', 'MATCH', 'brand_fitness_local', 'UP', 'Perfect local fitness brand for my community'),
    ('feedback_match_002', 'cmey5e6u100012gyg1tav9ztb', 'cmey5e6tn00002gyg2c491btl', 'MATCH', 'brand_outdoor_premium', 'UP', 'Love outdoor brands, great for adventure content'),
    ('feedback_match_003', 'cmey5e6u100012gyg1tav9ztb', 'cmey5e6tn00002gyg2c491btl', 'MATCH', 'brand_mlm_avoid', 'DOWN', 'Avoid MLM companies, too pushy and salesy'),
    ('feedback_match_004', 'cmey5e6u100012gyg1tav9ztb', 'cmey5e6tn00002gyg2c491btl', 'MATCH', 'brand_dropship', 'DOWN', 'Dropshipping feels inauthentic to my audience'),
    ('feedback_match_005', 'cmey5e6u100012gyg1tav9ztb', 'cmey5e6tn00002gyg2c491btl', 'MATCH', 'brand_nearby_city', 'UP', 'Great nearby brand, love supporting local businesses'),
    
    -- Audit feedback for presentation style
    ('feedback_audit_001', 'cmey5e6u100012gyg1tav9ztb', 'cmey5e6tn00002gyg2c491btl', 'AUDIT', 'audit_bullet_001', 'UP', 'Love the bullet points, easy to scan and understand'),
    ('feedback_audit_002', 'cmey5e6u100012gyg1tav9ztb', 'cmey5e6tn00002gyg2c491btl', 'AUDIT', 'audit_jargon_001', 'DOWN', 'Too much jargon, needs simpler language'),
    ('feedback_audit_003', 'cmey5e6u100012gyg1tav9ztb', 'cmey5e6tn00002gyg2c491btl', 'AUDIT', 'audit_executive_001', 'UP', 'Perfect executive summary, concise and actionable'),
    ('feedback_audit_004', 'cmey5e6u100012gyg1tav9ztb', 'cmey5e6tn00002gyg2c491btl', 'AUDIT', 'audit_generic_001', 'DOWN', 'Too generic, needs more specific insights')
ON CONFLICT ("id") DO NOTHING;

-- 5. Update existing EvalResult rows with sample user approval rates
UPDATE "public"."EvalResult" 
SET "userApprovalRate" = 0.75 
WHERE "userApprovalRate" = 0 OR "userApprovalRate" IS NULL;

-- 6. Create a view for easy bias computation (optional, for debugging)
CREATE OR REPLACE VIEW "public"."feedback_bias_summary" AS
SELECT 
    "workspaceId",
    "type",
    COUNT(*) as total_feedback,
    COUNT(CASE WHEN "decision" = 'UP' THEN 1 END) as upvotes,
    COUNT(CASE WHEN "decision" = 'DOWN' THEN 1 END) as downvotes,
    ROUND(
        COUNT(CASE WHEN "decision" = 'UP' THEN 1 END)::DECIMAL / COUNT(*), 2
    ) as approval_rate,
    MAX("createdAt") as last_feedback
FROM "public"."AiFeedback"
WHERE "createdAt" >= NOW() - INTERVAL '14 days'
GROUP BY "workspaceId", "type";

-- 7. Verify the setup
SELECT 
    'AiFeedback' as table_name,
    COUNT(*) as record_count,
    COUNT(DISTINCT "workspaceId") as workspaces,
    COUNT(DISTINCT "type") as feedback_types
FROM "public"."AiFeedback"
UNION ALL
SELECT 
    'EvalResult' as table_name,
    COUNT(*) as record_count,
    COUNT(DISTINCT "workspaceId") as workspaces,
    AVG("userApprovalRate")::TEXT as avg_approval_rate
FROM "public"."EvalResult";

-- 8. Show sample bias computation results
SELECT 
    'OUTREACH' as type,
    COUNT(CASE WHEN "decision" = 'UP' THEN 1 END) as upvotes,
    COUNT(CASE WHEN "decision" = 'DOWN' THEN 1 END) as downvotes,
    ROUND(
        COUNT(CASE WHEN "decision" = 'UP' THEN 1 END)::DECIMAL / COUNT(*), 2
    ) as approval_rate
FROM "public"."AiFeedback"
WHERE "type" = 'OUTREACH' AND "workspaceId" = 'cmey5e6u100012gyg1tav9ztb'
UNION ALL
SELECT 
    'MATCH' as type,
    COUNT(CASE WHEN "decision" = 'UP' THEN 1 END) as upvotes,
    COUNT(CASE WHEN "decision" = 'DOWN' THEN 1 END) as downvotes,
    ROUND(
        COUNT(CASE WHEN "decision" = 'UP' THEN 1 END)::DECIMAL / COUNT(*), 2
    ) as approval_rate
FROM "public"."AiFeedback"
WHERE "type" = 'MATCH' AND "workspaceId" = 'cmey5e6u100012gyg1tav9ztb'
UNION ALL
SELECT 
    'AUDIT' as type,
    COUNT(CASE WHEN "decision" = 'UP' THEN 1 END) as upvotes,
    COUNT(CASE WHEN "decision" = 'DOWN' THEN 1 END) as downvotes,
    ROUND(
        COUNT(CASE WHEN "decision" = 'UP' THEN 1 END)::DECIMAL / COUNT(*), 2
    ) as approval_rate
FROM "public"."AiFeedback"
WHERE "type" = 'AUDIT' AND "workspaceId" = 'cmey5e6u100012gyg1tav9ztb';
