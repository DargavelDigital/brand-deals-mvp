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
    
    // Use query param if provided, otherwise resolve from session
    const workspaceId = queryWorkspaceId || await resolveWorkspaceId();
    console.log('🔍 Final workspaceId:', workspaceId);
    
    // Query REAL database for latest brand run
    const run = await prisma().brandRun.findFirst({
      where: { workspaceId },
      orderBy: { updatedAt: 'desc' }
    });
    
    console.log('🔍 Database query result:', {
      found: !!run,
      id: run?.id,
      step: run?.step,
      selectedBrandIds: run?.selectedBrandIds,
      selectedBrandIdsLength: run?.selectedBrandIds?.length,
      selectedBrandIdsType: typeof run?.selectedBrandIds,
      isArray: Array.isArray(run?.selectedBrandIds),
      updatedAt: run?.updatedAt
    });
    
    if (run) {
      const progressViz = await buildProgressViz(workspaceId, run.step);
      const response = { 
        data: run,
        ui: { progressViz }
      };
      console.log('✅ Returning real BrandRun data');
      return NextResponse.json(response);
    }
    
    // No run found - create a new one in CONNECT state
    console.log('⚠️ No BrandRun found, creating initial run...');
    const newRun = await prisma().brandRun.create({
      data: {
        id: `run_${workspaceId}_${Date.now()}`,
        workspaceId,
        step: 'CONNECT',
        auto: false,
        selectedBrandIds: []
      }
    });
    
    const progressViz = await buildProgressViz(workspaceId, 'CONNECT');
    console.log('✅ Created new BrandRun:', newRun.id);
    
    return NextResponse.json({ 
      data: newRun,
      ui: { progressViz }
    });
  } catch (error: any) {
    console.error('❌ Error getting current run:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to get current run: ' + error.message },
      { status: 500 }
    );
  }
}, { route: '/api/brand-run/current' })
