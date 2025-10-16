import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-options';
import { getCurrentRunForWorkspace } from '@/services/orchestrator/brandRunHelper';
import { safe } from '@/lib/api/safeHandler';
import { db } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

async function resolveWorkspaceId(userId: string): Promise<string | null> {
  try {
    console.log('🔍 [CURRENT] Looking up workspace for userId:', userId);
    
    // Get workspace from membership (EXACT pattern from agency/list!)
    const membership = await db().membership.findFirst({
      where: { 
        userId: userId,
        role: { in: ['OWNER', 'MANAGER', 'MEMBER'] }
      },
      select: { workspaceId: true },
      orderBy: { createdAt: 'asc' }
    });
    
    if (membership) {
      console.log('✅ [CURRENT] Resolved workspaceId:', membership.workspaceId);
      return membership.workspaceId;
    }
    
    console.error('❌ [CURRENT] No membership found for userId:', userId);
    return null;
  } catch (error) {
    console.error('❌ [CURRENT] Failed to resolve workspace:', error);
    return null;
  }
}

/**
 * Generate progressViz data based on current state
 */
async function buildProgressViz(workspaceId: string, currentStep: string) {
  // Check if Instagram is connected
  let hasInstagram = false;
  try {
    const socialAccount = await db().socialAccount.findFirst({
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
    console.log('🔍 [CURRENT] GET called');
    
    // Get session (EXACT pattern from agency/list!)
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      console.error('❌ [CURRENT] No session found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    console.log('✅ [CURRENT] Session found for:', session.user.email);
    
    // Get workspaceId from membership
    const queryWorkspaceId = await resolveWorkspaceId(session.user.id);
    
    if (!queryWorkspaceId) {
      console.error('❌ [CURRENT] No workspace found for user');
      return NextResponse.json(
        { error: 'No workspace found for user' },
        { status: 404 }
      );
    }
    
    console.log('🔍 [CURRENT] Querying database for workspaceId:', queryWorkspaceId);
    
    // Query database for latest brand run (GET should not create!)
    const run = await db().brandRun.findFirst({
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
