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
  // CORRECT ORDER: CONNECT → AUDIT → MATCHES → CONTACTS → PACK → OUTREACH → DONE
  const stepOrder = ['CONNECT', 'AUDIT', 'MATCHES', 'CONTACTS', 'PACK', 'OUTREACH', 'DONE'];
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
      key: 'contacts', 
      label: 'Find contacts', 
      status: (currentIndex > 3 ? 'done' : currentIndex === 3 ? 'doing' : 'todo') as 'todo' | 'doing' | 'done'
    },
    { 
      key: 'mediapack', 
      label: 'Media pack', 
      status: (currentIndex > 4 ? 'done' : currentIndex === 4 ? 'doing' : 'todo') as 'todo' | 'doing' | 'done'
    },
    { 
      key: 'outreach', 
      label: 'Start outreach', 
      status: (currentIndex > 5 ? 'done' : currentIndex === 5 ? 'doing' : 'todo') as 'todo' | 'doing' | 'done'
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
    
    if (!queryWorkspaceId) {
      console.error('❌ No workspaceId provided in query params');
      return NextResponse.json(
        { error: 'Missing workspaceId query parameter' },
        { status: 400 }
      );
    }
    
    console.log('🔍 Querying database for workspaceId:', queryWorkspaceId);
    
    // Query REAL database for latest brand run (GET should not create!)
    const run = await prisma().brandRun.findFirst({
      where: { workspaceId: queryWorkspaceId },
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
    
    if (!run) {
      console.log('⚠️ No BrandRun found for workspace:', queryWorkspaceId);
      return NextResponse.json(
        { 
          error: 'No brand run found',
          message: 'Please complete the brand matching step first.',
          data: null
        },
        { status: 404 }
      );
    }
    
    // Return real data with progress viz
    const progressViz = await buildProgressViz(queryWorkspaceId, run.step);
    const response = { 
      data: run,
      ui: { progressViz }
    };
    
    console.log('✅ Returning real BrandRun with', run.selectedBrandIds?.length || 0, 'selected brands');
    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error('❌ Error getting current run:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to get current run: ' + error.message },
      { status: 500 }
    );
  }
}, { route: '/api/brand-run/current' })
