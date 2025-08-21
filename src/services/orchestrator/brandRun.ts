import { Providers } from '../providers';

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
    switch (run.step) {
      case 'AUDIT':
        // Call audit service via provider
        const auditResult = await Providers.audit.run({ 
          workspaceId: run.workspaceId, 
          socialAccounts: ['instagram', 'tiktok'] 
        });
        return { success: true, data: auditResult };
        
      case 'MATCHES':
        // Fetch brand matches via provider
        const matches = await Providers.discovery.run({ domain: 'demo.com', name: 'Demo Brand' });
        return { success: true, data: matches };
        
      case 'PACK':
        // Generate media pack via provider
        const mediaPack = await Providers.mediaPack.generate({ 
          brandId: run.selectedBrandIds[0] || 'demo', 
          creatorId: 'demo-creator', 
          variant: 'default' 
        });
        return { success: true, data: mediaPack };
        
      case 'CONTACTS':
        // Discover contacts for selected brands via provider
        const contacts = await Providers.discovery.run({ domain: 'demo.com', name: 'Demo Brand' });
        return { success: true, data: contacts };
        
      case 'OUTREACH':
        // Create and send outreach sequence via provider
        const sequence = await Providers.email.send({ 
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

// Mock service implementations (replace with real services later)
async function mockAuditService() {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing
  return {
    insights: [
      { id: '1', title: 'High Engagement on Fitness Content', metric: '4.2%', description: 'Your fitness posts outperform industry average by 40%' },
      { id: '2', title: 'Strong Millennial Audience', metric: '68%', description: 'Your content resonates particularly well with 25-34 age group' },
      { id: '3', title: 'Video Content Success', metric: '2.1x', description: 'Video posts generate 2.1x more engagement than static content' }
    ]
  };
}

async function mockMatchesService() {
  await new Promise(resolve => setTimeout(resolve, 800));
  return [
    {
      id: '1',
      name: 'Nike',
      description: 'Global athletic footwear and apparel brand',
      logoUrl: 'https://logo.clearbit.com/nike.com',
      categories: ['Fitness', 'Sports', 'Lifestyle'],
      matchScore: 94
    },
    {
      id: '2',
      name: 'Apple',
      description: 'Technology company known for innovative consumer electronics',
      logoUrl: 'https://logo.clearbit.com/apple.com',
      categories: ['Technology', 'Electronics', 'Lifestyle'],
      matchScore: 87
    },
    {
      id: '3',
      name: 'Starbucks',
      description: 'International coffeehouse chain',
      logoUrl: 'https://logo.clearbit.com/starbucks.com',
      categories: ['Food & Drink', 'Beverages', 'Lifestyle'],
      matchScore: 82
    }
  ];
}

async function mockMediaPackService(brandIds: string[]) {
  await new Promise(resolve => setTimeout(resolve, 1200));
  return {
    id: 'mp_1',
    htmlUrl: '/media-pack/preview',
    pdfUrl: '/media-pack/download',
    brandThemed: brandIds.length > 0
  };
}

async function mockContactsService(brandIds: string[]) {
  await new Promise(resolve => setTimeout(resolve, 900));
  return [
    {
      id: '1',
      name: 'Sarah Johnson',
      title: 'Marketing Manager',
      email: 'sarah.johnson@nike.com',
      verified: true,
      brandId: '1'
    },
    {
      id: '2',
      name: 'Mike Chen',
      title: 'Partnerships Director',
      email: 'mike.chen@apple.com',
      verified: true,
      brandId: '2'
    }
  ];
}

async function mockOutreachService(run: BrandRun) {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    id: 'seq_1',
    status: 'SENT',
    sentAt: new Date(),
    template: 'intro_v1'
  };
}
