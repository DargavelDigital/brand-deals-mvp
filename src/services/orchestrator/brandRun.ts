import { getProviders } from '../providers';

export type RunStep = 'CONNECT' | 'AUDIT' | 'MATCHES' | 'APPROVE' | 'PACK' | 'CONTACTS' | 'OUTREACH';

export interface BrandRun {
  id: string;
  workspaceId: string;
  step: RunStep;
  auto: boolean;
  selectedBrandIds: string[];
  mediaPackId?: string;
  sequenceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

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

// Service orchestration functions
export async function executeStep(run: BrandRun): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const providers = getProviders();
    
    switch (run.step) {
      case 'AUDIT':
        // Call audit service via provider
        const auditResult = await providers.audit(run.workspaceId);
        return { success: true, data: auditResult };
        
      case 'MATCHES':
        // Fetch brand matches via provider
        const matches = await providers.discovery(run.workspaceId, { domain: 'demo.com', name: 'Demo Brand' });
        return { success: true, data: matches };
        
      case 'PACK':
        // Generate media pack via provider
        const mediaPack = await providers.mediaPack({ 
          brandId: run.selectedBrandIds[0] || 'demo', 
          creatorId: 'demo-creator', 
          variant: 'default' 
        });
        return { success: true, data: mediaPack };
        
      case 'CONTACTS':
        // Discover contacts for selected brands via provider
        const contacts = await providers.discovery(run.workspaceId, { domain: 'demo.com', name: 'Demo Brand' });
        return { success: true, data: contacts };
        
      case 'OUTREACH':
        // Create and send outreach sequence via provider
        const sequence = await providers.email({ 
          to: 'demo@example.com', 
          subject: 'Demo Outreach', 
          html: '<p>Demo email content</p>' 
        });
        return { success: true, data: sequence };
        
      default:
        return { success: true };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
