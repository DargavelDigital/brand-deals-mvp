-- Update MediaPack table to add PDF metadata fields
-- Run this in your Neon database console

-- Check if columns already exist before adding them
DO $$ 
BEGIN
    -- Add brandId if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='MediaPack' AND column_name='brandId') THEN
        ALTER TABLE "MediaPack" ADD COLUMN "brandId" TEXT;
    END IF;

    -- Add brandName if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='MediaPack' AND column_name='brandName') THEN
        ALTER TABLE "MediaPack" ADD COLUMN "brandName" TEXT;
    END IF;

    -- Add fileUrl if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='MediaPack' AND column_name='fileUrl') THEN
        ALTER TABLE "MediaPack" ADD COLUMN "fileUrl" TEXT;
    END IF;

    -- Add fileId if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='MediaPack' AND column_name='fileId') THEN
        ALTER TABLE "MediaPack" ADD COLUMN "fileId" TEXT;
    END IF;

    -- Add fileName if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='MediaPack' AND column_name='fileName') THEN
        ALTER TABLE "MediaPack" ADD COLUMN "fileName" TEXT;
    END IF;

    -- Add format if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='MediaPack' AND column_name='format') THEN
        ALTER TABLE "MediaPack" ADD COLUMN "format" TEXT DEFAULT 'pdf';
    END IF;

    -- Add status if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='MediaPack' AND column_name='status') THEN
        ALTER TABLE "MediaPack" ADD COLUMN "status" TEXT DEFAULT 'READY';
    END IF;

    -- Add generatedAt if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='MediaPack' AND column_name='generatedAt') THEN
        ALTER TABLE "MediaPack" ADD COLUMN "generatedAt" TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS "MediaPack_brandId_idx" ON "MediaPack"("brandId");

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'MediaPack'
ORDER BY ordinal_position;

