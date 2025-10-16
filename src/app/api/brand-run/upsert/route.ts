import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureWorkspace } from '@/lib/workspace';
import { createRunForWorkspace, getCurrentRunForWorkspace, updateRunStep } from '@/services/orchestrator/brandRunHelper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

async function resolveWorkspaceId(userEmail: string, bodyWorkspaceId?: string): Promise<string | null> {
  // 1) prefer explicit body id if valid
  if (bodyWorkspaceId) {
    try {
      const found = await prisma.workspace.findUnique({ where: { id: bodyWorkspaceId } });
      if (found) return found.id;
    } catch (error) {
      console.warn('Failed to find workspace by ID:', error);
    }
  }

  // 2) Get workspace from user's membership (works for OAuth users!)
  try {
    console.log('🔍 [UPSERT] Looking up workspace membership for:', userEmail);
    
    const membership = await prisma.workspaceMembership.findFirst({
      where: {
        User_Membership_userIdToUser: {
          email: userEmail
        }
      },
      select: {
        workspaceId: true,
        Workspace: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    console.log('🔍 [UPSERT] Membership lookup result:', {
      found: !!membership,
      workspaceId: membership?.workspaceId,
      workspaceName: membership?.Workspace?.name
    });
    
    if (membership?.workspaceId) {
      return membership.workspaceId;
    }
  } catch (error) {
    console.error('❌ [UPSERT] Failed to get workspace from membership:', error);
  }

  // No fallback to demo workspace - return null
  console.error('❌ [UPSERT] Could not resolve workspace for user:', userEmail);
  return null;
}

export async function POST(request: NextRequest) {
  try {
    console.log('💾 [UPSERT] Step 1 - API called at', new Date().toISOString());
    
    // Get session FIRST
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/auth/nextauth-options');
    const session = await getServerSession(authOptions);
    
    console.log('💾 [UPSERT] Step 2 - Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      email: session?.user?.email,
      role: session?.user?.role
    });
    
    if (!session?.user?.email) {
      console.error('❌ [UPSERT] No session found');
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    console.log('💾 [UPSERT] Step 3 - Request body:', {
      keys: Object.keys(body),
      selectedBrandIdsCount: body.selectedBrandIds?.length || 0,
      step: body.step,
      auto: body.auto
    });
    
    const { auto = false, step, selectedBrandIds, runSummaryJson } = body;
    
    // Ensure we have a valid workspace ID from user's membership
    const workspaceId = await resolveWorkspaceId(session.user.email, body.workspaceId);
    console.log('💾 [UPSERT] Step 4 - Resolved workspaceId:', workspaceId);
    
    if (!workspaceId) {
      console.error('❌ [UPSERT] Could not resolve workspace for user:', session.user.email);
      return NextResponse.json(
        { error: 'No workspace found. Please contact support.' },
        { status: 404 }
      );
    }

    // Find existing run (direct Prisma query)
    console.log('💾 [UPSERT] Step 5 - Querying for existing run...');
    let run = await prisma.brandRun.findFirst({
      where: { workspaceId },
      orderBy: { updatedAt: 'desc' }
    });
    
    console.log('💾 [UPSERT] Step 6 - Existing run:', run ? `Found (${run.id})` : 'Not found');
    
    if (run) {
      // Update existing run
      const updateData: any = { updatedAt: new Date() };
      if (step) updateData.step = step;
      if (selectedBrandIds !== undefined) updateData.selectedBrandIds = selectedBrandIds;
      if (runSummaryJson !== undefined) updateData.runSummaryJson = runSummaryJson;
      
      console.log('💾 [UPSERT] Step 7 - Updating with:', {
        ...updateData,
        runSummaryJson: runSummaryJson ? `${runSummaryJson.brands?.length || 0} brands` : 'none'
      });
      
      run = await prisma.brandRun.update({
        where: { id: run.id },
        data: updateData
      });
      
      console.log('✅ [UPSERT] Step 8 - Updated BrandRun:', {
        id: run.id,
        step: run.step,
        selectedBrandIds: run.selectedBrandIds,
        selectedBrandIdsLength: run.selectedBrandIds?.length,
        brandsInSummary: run.runSummaryJson?.brands?.length || 0
      });
    } else {
      // Create new run
      console.log('💾 [UPSERT] Step 7 - Creating new run...');
      
      run = await prisma.brandRun.create({
        data: {
          id: `run_${workspaceId}_${Date.now()}`,
          workspaceId,
          step: step || 'MATCHES',
          auto,
          selectedBrandIds: selectedBrandIds || [],
          runSummaryJson: runSummaryJson || null,
          updatedAt: new Date()
        }
      });
      
      console.log('✅ [UPSERT] Step 8 - Created BrandRun:', {
        id: run.id,
        step: run.step,
        selectedBrandIds: run.selectedBrandIds,
        selectedBrandIdsLength: run.selectedBrandIds?.length,
        brandsInSummary: run.runSummaryJson?.brands?.length || 0
      });
    }
    
    // Verify it was saved by reading back
    console.log('💾 [UPSERT] Step 9 - Verifying save...');
    const verification = await prisma.brandRun.findFirst({
      where: { workspaceId },
      orderBy: { updatedAt: 'desc' }
    });
    
    console.log('💾 [UPSERT] Step 9 - Verification:', {
      found: !!verification,
      id: verification?.id,
      selectedBrandIds: verification?.selectedBrandIds,
      selectedBrandIdsLength: verification?.selectedBrandIds?.length,
      matches: verification?.id === run.id
    });
    
    if (verification?.id !== run.id) {
      console.error('❌ [UPSERT] VERIFICATION FAILED - IDs dont match!');
    }
    
    console.log('✅ [UPSERT] Step 10 - Returning response');
    return NextResponse.json({ data: run });
    
  } catch (error: any) {
    console.error('❌ [UPSERT] Error:', error);
    console.error('❌ [UPSERT] Error name:', error.name);
    console.error('❌ [UPSERT] Error message:', error.message);
    console.error('❌ [UPSERT] Stack:', error.stack);
    
    // Don't return mock data - return actual error
    return NextResponse.json(
      { error: error.message || 'Failed to save brand run' },
      { status: 500 }
    );
  }
}
