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
