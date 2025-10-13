import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureWorkspace } from '@/lib/workspace';
import { createRunForWorkspace, getCurrentRunForWorkspace, updateRunStep } from '@/services/orchestrator/brandRunHelper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

async function resolveWorkspaceId(bodyWorkspaceId?: string): Promise<string | null> {
  // 1) prefer explicit body id if valid
  if (bodyWorkspaceId) {
    try {
      const found = await prisma().workspace.findUnique({ where: { id: bodyWorkspaceId } });
      if (found) return found.id;
    } catch (error) {
      console.warn('Failed to find workspace by ID:', error);
    }
  }

  // 2) try to get workspace from cookies/session
  try {
    const workspaceId = await ensureWorkspace();
    // Verify the workspace actually exists in database
    const workspace = await prisma().workspace.findUnique({ where: { id: workspaceId } });
    if (workspace) return workspace.id;
  } catch (error) {
    console.warn('Failed to get workspace from session:', error);
  }

  // No fallback to demo workspace - return null
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('💾 [UPSERT] Step 1 - Received body:', JSON.stringify(body, null, 2));
    
    const { auto = false, step, selectedBrandIds, runSummaryJson } = body;
    
    console.log('💾 [UPSERT] Step 2 - Parsed:', {
      auto,
      step,
      selectedBrandIds,
      selectedBrandIdsType: typeof selectedBrandIds,
      selectedBrandIdsLength: selectedBrandIds?.length,
      isArray: Array.isArray(selectedBrandIds),
      hasRunSummaryJson: !!runSummaryJson,
      brandsInSummary: runSummaryJson?.brands?.length || 0
    });
    
    // Ensure we have a valid workspace ID
    const workspaceId = await resolveWorkspaceId(body.workspaceId);
    console.log('💾 [UPSERT] Step 3 - Resolved workspaceId:', workspaceId);
    
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'No workspace found. Please log in.' },
        { status: 401 }
      );
    }

    // Find existing run (direct Prisma query)
    console.log('💾 [UPSERT] Step 4 - Querying for existing run...');
    let run = await prisma().brandRun.findFirst({
      where: { workspaceId },
      orderBy: { updatedAt: 'desc' }
    });
    
    console.log('💾 [UPSERT] Step 5 - Existing run:', run ? `Found (${run.id})` : 'Not found');
    
    if (run) {
      // Update existing run
      const updateData: any = { updatedAt: new Date() };
      if (step) updateData.step = step;
      if (selectedBrandIds !== undefined) updateData.selectedBrandIds = selectedBrandIds;
      if (runSummaryJson !== undefined) updateData.runSummaryJson = runSummaryJson;
      
      console.log('💾 [UPSERT] Step 6 - Updating with:', {
        ...updateData,
        runSummaryJson: runSummaryJson ? `${runSummaryJson.brands?.length || 0} brands` : 'none'
      });
      
      run = await prisma().brandRun.update({
        where: { id: run.id },
        data: updateData
      });
      
      console.log('✅ [UPSERT] Step 7 - Updated BrandRun:', {
        id: run.id,
        step: run.step,
        selectedBrandIds: run.selectedBrandIds,
        selectedBrandIdsLength: run.selectedBrandIds?.length,
        brandsInSummary: run.runSummaryJson?.brands?.length || 0
      });
    } else {
      // Create new run
      console.log('💾 [UPSERT] Step 6 - Creating new run...');
      
      run = await prisma().brandRun.create({
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
      
      console.log('✅ [UPSERT] Step 7 - Created BrandRun:', {
        id: run.id,
        step: run.step,
        selectedBrandIds: run.selectedBrandIds,
        selectedBrandIdsLength: run.selectedBrandIds?.length,
        brandsInSummary: run.runSummaryJson?.brands?.length || 0
      });
    }
    
    // Verify it was saved by reading back
    console.log('💾 [UPSERT] Step 8 - Verifying save...');
    const verification = await prisma().brandRun.findFirst({
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
