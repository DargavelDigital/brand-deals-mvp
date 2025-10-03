-- Fix MediaPack schema to use id as primary key and remove packId column
-- This migration aligns the database with the updated Prisma schema

-- First, add any missing columns to MediaPack if they don't exist
DO $$ 
BEGIN
    -- Add payload column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'MediaPack' AND column_name = 'payload') THEN
        ALTER TABLE "MediaPack" ADD COLUMN "payload" JSONB;
    END IF;
    
    -- Add theme column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'MediaPack' AND column_name = 'theme') THEN
        ALTER TABLE "MediaPack" ADD COLUMN "theme" JSONB;
    END IF;
    
    -- Add contentHash column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'MediaPack' AND column_name = 'contentHash') THEN
        ALTER TABLE "MediaPack" ADD COLUMN "contentHash" TEXT;
    END IF;
    
    -- Add shareToken column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'MediaPack' AND column_name = 'shareToken') THEN
        ALTER TABLE "MediaPack" ADD COLUMN "shareToken" TEXT;
        CREATE UNIQUE INDEX "MediaPack_shareToken_key" ON "MediaPack"("shareToken");
    END IF;
END $$;

-- Update MediaPackFile table to use packId instead of packIdRef
DO $$ 
BEGIN
    -- Rename packIdRef to packId if packIdRef exists and packId doesn't
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'MediaPackFile' AND column_name = 'packIdRef')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'MediaPackFile' AND column_name = 'packId') THEN
        ALTER TABLE "MediaPackFile" RENAME COLUMN "packIdRef" TO "packId";
    END IF;
    
    -- Create MediaPackFile table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_name = 'MediaPackFile') THEN
        CREATE TABLE "MediaPackFile"(
            "id" TEXT NOT NULL,
            "packId" TEXT NOT NULL,
            "variant" TEXT NOT NULL,
            "mime" TEXT NOT NULL,
            "size" INTEGER NOT NULL,
            "sha256" TEXT NOT NULL,
            "data" BYTEA NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT "MediaPackFile_pkey" PRIMARY KEY ("id")
        );
        
        CREATE INDEX "MediaPackFile_packId_idx" ON "MediaPackFile"("packId");
        CREATE INDEX "MediaPackFile_variant_createdAt_idx" ON "MediaPackFile"("variant", "createdAt");
        ALTER TABLE "MediaPackFile" ADD CONSTRAINT "MediaPackFile_packId_fkey" 
            FOREIGN KEY ("packId") REFERENCES "MediaPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Create MediaPackShareToken table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_name = 'MediaPackShareToken') THEN
        CREATE TABLE "MediaPackShareToken"(
            "token" TEXT NOT NULL,
            "fileId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT "MediaPackShareToken_pkey" PRIMARY KEY ("token")
        );
        
        ALTER TABLE "MediaPackShareToken" ADD CONSTRAINT "MediaPackShareToken_fileId_fkey" 
            FOREIGN KEY ("fileId") REFERENCES "MediaPackFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
