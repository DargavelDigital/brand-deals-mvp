-- This migration was applied to the database but the local file was missing
-- Adding it back to resolve the migration state mismatch

-- Add payload column to MediaPack table
ALTER TABLE "MediaPack" ADD COLUMN "payload" JSONB;
