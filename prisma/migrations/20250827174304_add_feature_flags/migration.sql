-- Add featureFlags JSON field to Workspace table
ALTER TABLE "Workspace" ADD COLUMN "featureFlags" JSON DEFAULT '{}';

-- Update existing workspaces to have empty featureFlags
UPDATE "Workspace" SET "featureFlags" = '{}' WHERE "featureFlags" IS NULL;
