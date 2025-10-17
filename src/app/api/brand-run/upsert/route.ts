import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-options';
import { db } from '@/lib/prisma';
import { createRunForWorkspace, getCurrentRunForWorkspace, updateRunStep } from '@/services/orchestrator/brandRunHelper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

async function resolveWorkspaceId(userId: string, bodyWorkspaceId?: string): Promise<string | null> {
  // 1) prefer explicit body id if valid
  if (bodyWorkspaceId) {
    try {
      const found = await db().workspace.findUnique({ where: { id: bodyWorkspaceId } });
      if (found) return found.id;
    } catch (error) {
      console.warn('Failed to find workspace by ID:', error);
    }
  }

  // 2) Auto-detect workspaceId from user's membership (EXACT COPY from agency/list!)
  try {
    console.log('🔍 [UPSERT] Looking up workspace membership for userId:', userId);
    
    const membership = await db().membership.findFirst({
      where: { 
        userId: userId,
        role: { in: ['OWNER', 'MANAGER', 'MEMBER'] }
      },
      select: { workspaceId: true },
      orderBy: { createdAt: 'asc' } // Get oldest (likely main workspace)
    });
    
    console.log('🔍 [UPSERT] Membership lookup result:', {
      found: !!membership,
      workspaceId: membership?.workspaceId
    });
    
    if (membership) {
      console.log('✅ Auto-detected workspaceId from membership:', membership.workspaceId);
      return membership.workspaceId;
    }
  } catch (error) {
    console.error('❌ [UPSERT] Failed to get workspace from membership:', error);
  }

  // No fallback to demo workspace - return null
  console.error('❌ [UPSERT] Could not resolve workspace for userId:', userId);
  return null;
}

export async function POST(request: NextRequest) {
  try {
    console.log('💾 [UPSERT] Step 1 - API called at', new Date().toISOString());
    
    // Get session (EXACT COPY from agency/list pattern)
    const session = await getServerSession(authOptions);
    
    console.log('💾 [UPSERT] Step 2 - Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      email: session?.user?.email
    });
    
    if (!session || !session.user?.id) {
      console.error('❌ [UPSERT] No session or user ID found');
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
    
    // Ensure we have a valid workspace ID (use userId, not email!)
    const workspaceId = await resolveWorkspaceId(session.user.id, body.workspaceId);
    console.log('💾 [UPSERT] Step 4 - Resolved workspaceId:', workspaceId);
    
    if (!workspaceId) {
      console.error('❌ [UPSERT] Could not resolve workspace for userId:', session.user.id);
      return NextResponse.json(
        { error: 'No workspace found. Please contact support.' },
        { status: 404 }
      );
    }

    // Find existing run (use db() like agency/list does!)
    console.log('💾 [UPSERT] Step 5 - Querying for existing run...');
    let run = await db().brandRun.findFirst({
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
      
      run = await db().brandRun.update({
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
      
      // CRITICAL FIX: Create BrandMatch records for each selected brand
      if (selectedBrandIds && selectedBrandIds.length > 0) {
        console.log('🔵 [UPSERT] Creating/updating BrandMatch records for', selectedBrandIds.length, 'brands');
        
        for (const brandId of selectedBrandIds) {
          try {
            // Get brand details from runSummaryJson if available
            const brandFromSummary = runSummaryJson?.brands?.find((b: any) => b.id === brandId);
            const score = brandFromSummary?.score || brandFromSummary?.matchScore || 75;
            const reasons = brandFromSummary?.reasons || brandFromSummary?.matchReasons || ['Approved by user'];
            
            await db().brandMatch.upsert({
              where: {
                workspaceId_brandId: {
                  workspaceId: workspaceId,
                  brandId: brandId
                }
              },
              create: {
                id: `match_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                workspaceId: workspaceId,
                brandId: brandId,
                score: score,
                reasons: Array.isArray(reasons) ? reasons : [String(reasons)]
              },
              update: {
                score: score,
                reasons: Array.isArray(reasons) ? reasons : [String(reasons)]
              }
            });
            
            console.log('✅ [UPSERT] Created/updated BrandMatch for:', brandId);
          } catch (matchError: any) {
            console.error('❌ [UPSERT] Failed to create BrandMatch for', brandId, ':', matchError.message);
            // Continue with other brands even if one fails
          }
        }
        
        console.log('✅ [UPSERT] Finished creating BrandMatch records');
      }
    } else {
      // Create new run
      console.log('💾 [UPSERT] Step 7 - Creating new run...');
      
      run = await db().brandRun.create({
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
      
      // CRITICAL FIX: Create BrandMatch records for each selected brand
      if (selectedBrandIds && selectedBrandIds.length > 0) {
        console.log('🔵 [UPSERT] Creating/updating BrandMatch records for', selectedBrandIds.length, 'brands');
        
        for (const brandId of selectedBrandIds) {
          try {
            // Get brand details from runSummaryJson if available
            const brandFromSummary = runSummaryJson?.brands?.find((b: any) => b.id === brandId);
            const score = brandFromSummary?.score || brandFromSummary?.matchScore || 75;
            const reasons = brandFromSummary?.reasons || brandFromSummary?.matchReasons || ['Approved by user'];
            
            await db().brandMatch.upsert({
              where: {
                workspaceId_brandId: {
                  workspaceId: workspaceId,
                  brandId: brandId
                }
              },
              create: {
                id: `match_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                workspaceId: workspaceId,
                brandId: brandId,
                score: score,
                reasons: Array.isArray(reasons) ? reasons : [String(reasons)]
              },
              update: {
                score: score,
                reasons: Array.isArray(reasons) ? reasons : [String(reasons)]
              }
            });
            
            console.log('✅ [UPSERT] Created/updated BrandMatch for:', brandId);
          } catch (matchError: any) {
            console.error('❌ [UPSERT] Failed to create BrandMatch for', brandId, ':', matchError.message);
            // Continue with other brands even if one fails
          }
        }
        
        console.log('✅ [UPSERT] Finished creating BrandMatch records');
      }
    }
    
    // Verify it was saved by reading back
    console.log('💾 [UPSERT] Step 9 - Verifying save...');
    const verification = await db().brandRun.findFirst({
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
