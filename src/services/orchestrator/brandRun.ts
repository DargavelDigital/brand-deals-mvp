// Temporarily disabled for static export
// import { getProviders } from '../providers';
// import { getCurrentRunForWorkspace, updateRunStep } from './brandRunHelper';

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
  return null;
}

export async function advanceRun(workspaceId: string, step: RunStep): Promise<void> {
  // Mock implementation
}

export async function recordRunAction(workspaceId: string, action: string, data?: any): Promise<void> {
  // Mock implementation
}

// Service orchestration functions
export async function executeStep(run: BrandRun): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // const providers = getProviders(); // Temporarily disabled for static export
    
    switch (run.step) {
      case 'AUDIT':
        // Call audit service via provider
        // const auditResult = await providers.audit(run.workspaceId); // Temporarily disabled for static export
        return { success: true, data: { message: 'Audit step skipped for static export' } };
        
      case 'MATCHES':
        // Fetch brand matches via provider
        // const matches = await providers.discovery(run.workspaceId, { domain: 'demo.com', name: 'Demo Brand' }); // Temporarily disabled for static export
        return { success: true, data: { message: 'Matches step skipped for static export' } };
        
      case 'PACK':
        // Generate media pack via provider
        // const mediaPack = await providers.mediaPack({  // Temporarily disabled for static export
        //   brandId: run.selectedBrandIds[0] || 'demo', 
        //   creatorId: 'demo-creator', 
        //   variant: 'default' 
        // });
        return { success: true, data: { message: 'Pack step skipped for static export' } };
        
      case 'CONTACTS':
        // Discover contacts for selected brands via provider
        // const contacts = await providers.discovery(run.workspaceId, { domain: 'demo.com', name: 'Demo Brand' }); // Temporarily disabled for static export
        return { success: true, data: { message: 'Contacts step skipped for static export' } };
        
      case 'OUTREACH':
        // Create and send outreach sequence via provider
        // const sequence = await providers.email({  // Temporarily disabled for static export
        //   to: 'demo@example.com', 
        //   subject: 'Demo Outreach', 
        //   html: '<p>Demo email content</p>' 
        // });
        return { success: true, data: { message: 'Outreach step skipped for static export' } };
        
      default:
        return { success: true };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
