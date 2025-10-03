-- Add missing columns to MediaPack table
-- This migration adds the columns that are defined in the schema but missing from the database

-- Add packId column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'MediaPack' AND column_name = 'packId') THEN
        ALTER TABLE "MediaPack" ADD COLUMN "packId" TEXT;
        CREATE UNIQUE INDEX "MediaPack_packId_key" ON "MediaPack"("packId");
    END IF;
END $$;

-- Add payload column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'MediaPack' AND column_name = 'payload') THEN
        ALTER TABLE "MediaPack" ADD COLUMN "payload" JSONB;
    END IF;
END $$;

-- Add contentHash column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'MediaPack' AND column_name = 'contentHash') THEN
        ALTER TABLE "MediaPack" ADD COLUMN "contentHash" TEXT;
    END IF;
END $$;

-- Create MediaPackFile table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_name = 'MediaPackFile') THEN
        CREATE TABLE "MediaPackFile"(
            "id" TEXT NOT NULL,
            "packIdRef" TEXT NOT NULL,
            "variant" TEXT NOT NULL,
            "mime" TEXT NOT NULL,
            "size" INTEGER NOT NULL,
            "sha256" TEXT NOT NULL,
            "data" BYTEA NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT "MediaPackFile_pkey" PRIMARY KEY ("id")
        );
        
        CREATE INDEX "MediaPackFile_packIdRef_idx" ON "MediaPackFile"("packIdRef");
        CREATE INDEX "MediaPackFile_variant_createdAt_idx" ON "MediaPackFile"("variant", "createdAt");
        ALTER TABLE "MediaPackFile" ADD CONSTRAINT "MediaPackFile_packIdRef_fkey" 
            FOREIGN KEY ("packIdRef") REFERENCES "MediaPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
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
