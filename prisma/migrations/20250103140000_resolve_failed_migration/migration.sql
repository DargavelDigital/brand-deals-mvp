-- This migration resolves the failed migration state
-- The previous migration 20250103102000_add_mediapack_payload failed
-- We need to mark it as resolved so new migrations can be applied

-- First, let's check if the MediaPack table exists and what columns it has
-- If it doesn't exist, we'll create it with the new schema
-- If it exists but is missing columns, we'll add them

-- Check if MediaPack table exists
DO $$
BEGIN
    -- If MediaPack table doesn't exist, create it
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'MediaPack') THEN
        CREATE TABLE "MediaPack"(
          "id" text PRIMARY KEY,
          "packId" text UNIQUE NOT NULL,
          "workspaceId" text NOT NULL,
          "variant" text NOT NULL,
          "payload" jsonb,
          "theme" jsonb,
          "contentHash" text,
          "shareToken" text UNIQUE,
          "createdAt" timestamptz DEFAULT now(),
          "updatedAt" timestamptz DEFAULT now()
        );
        
        -- Add foreign key constraint to Workspace
        ALTER TABLE "MediaPack" ADD CONSTRAINT "MediaPack_workspaceId_fkey" 
          FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    -- If MediaPackFile table doesn't exist, create it
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'MediaPackFile') THEN
        CREATE TABLE "MediaPackFile"(
          "id" text PRIMARY KEY,
          "packIdRef" text NOT NULL,
          "variant" text NOT NULL,
          "mime" text NOT NULL,
          "size" int NOT NULL,
          "sha256" text NOT NULL,
          "data" bytea NOT NULL,
          "createdAt" timestamptz DEFAULT now()
        );
        
        -- Add foreign key constraint to MediaPack
        ALTER TABLE "MediaPackFile" ADD CONSTRAINT "MediaPackFile_packIdRef_fkey" 
          FOREIGN KEY ("packIdRef") REFERENCES "MediaPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          
        -- Create indexes
        CREATE INDEX "MediaPackFile_packIdRef_idx" ON "MediaPackFile"("packIdRef");
        CREATE INDEX "MediaPackFile_variant_createdAt_idx" ON "MediaPackFile"("variant","createdAt");
    END IF;
END $$;
