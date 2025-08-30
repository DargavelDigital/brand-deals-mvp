-- Epic 23: Model Quality Ops - Evaluation Results
-- Add EvalResult table for tracking AI model performance

-- Create EvalResult table
CREATE TABLE IF NOT EXISTS "public"."EvalResult" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "auditScore" DOUBLE PRECISION NOT NULL,
    "matchScore" DOUBLE PRECISION NOT NULL,
    "outreachScore" DOUBLE PRECISION NOT NULL,
    "avgTokens" INTEGER NOT NULL,
    "totalTests" INTEGER NOT NULL,
    "passedTests" INTEGER NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    CONSTRAINT "EvalResult_pkey" PRIMARY KEY ("id")
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "EvalResult_date_idx" ON "public"."EvalResult"("date");
CREATE INDEX IF NOT EXISTS "EvalResult_overallScore_idx" ON "public"."EvalResult"("overallScore");

-- Insert sample evaluation result for testing
INSERT INTO "public"."EvalResult" (
    "id", "date", "auditScore", "matchScore", "outreachScore", 
    "avgTokens", "totalTests", "passedTests", "overallScore"
) VALUES (
    'epic23_sample_001',
    CURRENT_TIMESTAMP,
    0.85,
    0.78,
    0.82,
    150,
    15,
    12,
    0.82
) ON CONFLICT ("id") DO NOTHING;

-- Verify table creation
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'EvalResult' 
ORDER BY ordinal_position;
