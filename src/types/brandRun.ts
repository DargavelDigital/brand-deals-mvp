export interface BrandRun {
  id: string;
  workspaceId: string;
  step: RunStep;
  auto: boolean;
  auditId?: string;
  selectedBrandIds?: string[];
  mediaPackId?: string;
  contactIds?: string[];
  sequenceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type RunStep = 'AUDIT' | 'MATCHES' | 'APPROVE' | 'PACK' | 'CONTACTS' | 'OUTREACH' | 'COMPLETE';

export interface PrerequisiteCheck {
  met: boolean;
  missing: string[];
  quickActions: Array<{
    label: string;
    action: string;
    href?: string;
  }>;
}

export type StepKey =
  | 'connections'
  | 'audit'
  | 'match'
  | 'select'
  | 'mediapack'
  | 'contacts'
  | 'outreach'
  | 'complete';

export type StepStatus = 'idle'|'running'|'ok'|'error';

export type StepRecord = {
  key: StepKey;
  status: StepStatus;
  startedAt?: string;
  endedAt?: string;
  error?: string;
  artifact?: Record<string, any>;
};

export type RunSummary = {
  runId: string;
  workspaceId: string;
  steps: StepRecord[];
  artifacts: {
    auditId?: string;
    matches?: Array<{ id: string; name: string; score?: number }>;
    selectedBrandIds?: string[];
    mediaPack?: { id?: string; htmlUrl?: string; pdfUrl?: string; variant: string };
    contacts?: Array<{ brandId: string; contactId: string; email?: string }>;
    outreach?: { sequenceId: string; status: 'PAUSED'|'ACTIVE'|'DRAFT' };
  };
  completed: boolean;
  completedAt?: string;
};
