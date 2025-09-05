// Defensive types for audit system
export type AuditStatus = 'queued' | 'running' | 'succeeded' | 'failed';

export interface AuditRow {
  id: string;
  workspaceId: string;
  provider?: string;
  jobId?: string;
  status?: AuditStatus;
  sources: string[];
  snapshotJson?: any;
  createdAt: Date;
  updatedAt?: Date;
}
