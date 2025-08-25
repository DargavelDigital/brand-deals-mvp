import { getProviders } from '../providers';
import { getCurrentRunForWorkspace, updateRunStep } from './brandRunHelper';

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

export type RunStep = 'CONNECT' | 'AUDIT' | 'MATCHES' | 'APPROVE' | 'PACK' | 'CONTACTS' | 'OUTREACH' | 'COMPLETE';

export interface RunPayload {
  step: RunStep;
  data?: any;
}

export interface PrerequisiteCheck {
  met: boolean;
  missing: string[];
  quickActions: Array<{
    label: string;
    action: string;
    href?: string;
  }>;
}

// Pure functions for managing run state
export function createRun(workspaceId: string, auto: boolean = false): Omit<BrandRun, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    workspaceId,
    step: 'CONNECT',
    auto,
    selectedBrandIds: [],
    contactIds: [],
  };
}

export function next(run: BrandRun, payload: RunPayload): BrandRun {
  return {
    ...run,
    step: payload.step,
    ...payload.data,
    updatedAt: new Date(),
  };
}

// Mock functions for static export
export async function getCurrentRun(workspaceId: string): Promise<BrandRun | null> {
  return await getCurrentRunForWorkspace(workspaceId);
}

export async function advanceRun(workspaceId: string, step: RunStep): Promise<void> {
  await updateRunStep(workspaceId, step);
}

export async function recordRunAction(workspaceId: string, action: string, data?: any): Promise<void> {
  // Log the action for audit purposes
  console.log(`Run action recorded: ${action}`, { workspaceId, data });
}

// Service orchestration functions
export async function executeStep(run: BrandRun): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const providers = getProviders();

    switch (run.step) {
      case 'AUDIT':
        const auditResult = await providers.audit(run.workspaceId, []);
        return { success: true, data: auditResult };

      case 'MATCHES':
        const matches = await providers.discovery(run.workspaceId, { domain: 'demo.com', name: 'Demo Brand' });
        return { success: true, data: matches };

      case 'PACK':
        const mediaPack = await providers.mediaPack({
          brandId: run.selectedBrandIds?.[0] || 'demo',
          creatorId: 'demo-creator',
          variant: 'default'
        });
        return { success: true, data: mediaPack };

      case 'CONTACTS':
        const contacts = await providers.discovery(run.workspaceId, { domain: 'demo.com', name: 'Demo Brand' });
        return { success: true, data: contacts };

      case 'OUTREACH':
        const sequence = await providers.email({
          to: 'demo@example.com',
          subject: 'Demo Outreach',
          html: '<p>Demo email content</p>'
        });
        return { success: true, data: sequence };

      default:
        return { success: false, error: `Unknown step: ${run.step}` };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
