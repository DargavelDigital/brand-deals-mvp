import { NextRequest, NextResponse } from 'next/server';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';
import { getCurrentRunForWorkspace } from '@/services/orchestrator/brandRunHelper';
import { safe } from '@/lib/api/safeHandler';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

async function resolveWorkspaceId(): Promise<string> {
  try {
    // Try to get workspace from session/demo first
    // requireSessionOrDemo returns an object { session, demo, workspaceId }
    const auth = await requireSessionOrDemo({} as NextRequest);
    const workspaceId = auth?.workspaceId || (typeof auth === 'string' ? auth : null);
    if (workspaceId) return workspaceId;
  } catch (error) {
    console.warn('Failed to get workspace from session:', error);
  }

  // Fallback to demo workspace
  try {
    const demoWorkspace = await prisma().workspace.upsert({
      where: { slug: 'demo-workspace' },
      update: {},
      create: { 
        name: 'Demo Workspace', 
        slug: 'demo-workspace' 
      }
    });
    return demoWorkspace.id;
  } catch (error) {
    console.error('Failed to create demo workspace:', error);
    throw new Error('Unable to create or find workspace');
  }
}

/**
 * Generate progressViz data based on current state
 */
async function buildProgressViz(workspaceId: string, currentStep: string) {
  // Check if Instagram is connected
  let hasInstagram = false;
  try {
    const socialAccount = await prisma().socialAccount.findFirst({
      where: {
        workspaceId,
        platform: 'instagram'
      }
    });
    hasInstagram = !!(socialAccount && socialAccount.accessToken);
  } catch (error) {
    console.warn('Failed to check Instagram connection:', error);
  }

  // Map steps to their status based on current step
  const stepOrder = ['CONNECT', 'AUDIT', 'MATCHES', 'APPROVE', 'PACK', 'CONTACTS', 'OUTREACH', 'DONE'];
  const currentIndex = stepOrder.indexOf(currentStep);

  const steps = [
    { 
      key: 'connect', 
      label: 'Connect accounts', 
      status: (currentIndex > 0 ? 'done' : currentIndex === 0 ? 'doing' : 'todo') as 'todo' | 'doing' | 'done'
    },
    { 
      key: 'audit', 
      label: 'Audit content', 
      status: (currentIndex > 1 ? 'done' : currentIndex === 1 ? 'doing' : 'todo') as 'todo' | 'doing' | 'done'
    },
    { 
      key: 'matches', 
      label: 'Brand matches', 
      status: (currentIndex > 2 ? 'done' : currentIndex === 2 ? 'doing' : 'todo') as 'todo' | 'doing' | 'done'
    },
    { 
      key: 'mediapack', 
      label: 'Media pack', 
      status: (currentIndex > 4 ? 'done' : currentIndex === 4 ? 'doing' : 'todo') as 'todo' | 'doing' | 'done'
    },
    { 
      key: 'outreach', 
      label: 'Start outreach', 
      status: (currentIndex > 6 ? 'done' : currentIndex === 6 ? 'doing' : 'todo') as 'todo' | 'doing' | 'done'
    },
  ];

  const percent = Math.round(((currentIndex + 1) / stepOrder.length) * 100);

  return {
    steps,
    currentKey: steps.find(s => s.status === 'doing')?.key || 'connect',
    percent,
  };
}

export const GET = safe(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const queryWorkspaceId = url.searchParams.get('workspaceId');
    
    console.log('🔍 GET /api/brand-run/current called');
    console.log('🔍 Query param workspaceId:', queryWorkspaceId);
    
    const workspaceId = await resolveWorkspaceId();
    console.log('🔍 Resolved workspaceId:', workspaceId);
    
    try {
      const currentRun = await getCurrentRunForWorkspace(workspaceId);
      console.log('🔍 Current run found:', {
        id: currentRun?.id,
        step: currentRun?.step,
        selectedBrandIds: currentRun?.selectedBrandIds,
        selectedBrandIdsLength: currentRun?.selectedBrandIds?.length,
        selectedBrandIdsType: typeof currentRun?.selectedBrandIds,
        isArray: Array.isArray(currentRun?.selectedBrandIds)
      });
      
      if (currentRun) {
        const progressViz = await buildProgressViz(workspaceId, currentRun.step);
        const response = { 
          data: currentRun,
          ui: { progressViz }
        };
        console.log('🔍 Returning response:', JSON.stringify(response, null, 2));
        return NextResponse.json(response);
      }
    } catch (dbError) {
      console.error('❌ Database query failed:', dbError);
    }
    
    // Fallback to mock data if no run exists or database fails
    const mockRun = {
      id: 'mock_' + Date.now(),
      workspaceId,
      step: 'CONNECT',
      auto: false,
      selectedBrandIds: [],
      contactIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: { brands: 0, creditsUsed: 0 }
    };
    const progressViz = await buildProgressViz(workspaceId, 'CONNECT');
    return NextResponse.json({ 
      data: mockRun,
      ui: { progressViz }
    });
  } catch (error: any) {
    console.error('Error getting current run:', error);
    return NextResponse.json(
      { error: 'Failed to get current run' },
      { status: 500 }
    );
  }
}, { route: '/api/brand-run/current' })
