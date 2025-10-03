-- Final fix for MediaPack schema
-- Add missing contentHash column and fix foreign key relationship

-- Add contentHash column to MediaPack if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'MediaPack' AND column_name = 'contentHash') THEN
        ALTER TABLE "MediaPack" ADD COLUMN "contentHash" TEXT;
    END IF;
END $$;

-- Fix MediaPackFile foreign key relationship if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'MediaPackFile_packId_fkey') THEN
        ALTER TABLE "MediaPackFile" ADD CONSTRAINT "MediaPackFile_packId_fkey" 
            FOREIGN KEY ("packId") REFERENCES "MediaPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
