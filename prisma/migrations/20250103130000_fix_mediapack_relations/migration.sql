-- Drop existing MediaPack table and recreate with proper relations
DROP TABLE IF EXISTS "MediaPack" CASCADE;

-- Recreate MediaPack table with all required fields
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

-- Recreate MediaPackFile table with proper relations
DROP TABLE IF EXISTS "MediaPackFile" CASCADE;

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

-- Recreate indexes
CREATE INDEX "MediaPackFile_packIdRef_idx" ON "MediaPackFile"("packIdRef");
CREATE INDEX "MediaPackFile_variant_createdAt_idx" ON "MediaPackFile"("variant","createdAt");
