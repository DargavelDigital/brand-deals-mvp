-- Create AuditJob table
CREATE TABLE IF NOT EXISTS "AuditJob" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "workspaceId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "progress" INTEGER NOT NULL DEFAULT 0,
  "stage" TEXT,
  "error" TEXT,
  "auditId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "AuditJob_workspaceId_fkey" FOREIGN KEY ("workspaceId") 
    REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "AuditJob_workspaceId_idx" ON "AuditJob"("workspaceId");
CREATE INDEX IF NOT EXISTS "AuditJob_status_idx" ON "AuditJob"("status");

-- Verify table was created
SELECT COUNT(*) as audit_job_table_exists FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'AuditJob';
