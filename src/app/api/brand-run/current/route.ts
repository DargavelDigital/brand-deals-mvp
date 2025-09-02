import { NextRequest, NextResponse } from 'next/server';
import { ensureWorkspace } from '@/lib/workspace';
import { getCurrentRunForWorkspace } from '@/services/orchestrator/brandRunHelper';
import { safe } from '@/lib/api/safeHandler';
import { prisma } from '@/lib/prisma';

async function resolveWorkspaceId(): Promise<string> {
  // Try to get workspace from cookies/session first
  try {
    const workspaceId = await ensureWorkspace();
    // Verify the workspace actually exists in database
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (workspace) return workspace.id;
  } catch (error) {
    console.warn('Failed to get workspace from session:', error);
  }

  // Fallback to demo workspace
  try {
    const demoWorkspace = await prisma.workspace.upsert({
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

export const GET = safe(async (request: NextRequest) => {
  try {
    const workspaceId = await resolveWorkspaceId();
    
    try {
      const currentRun = await getCurrentRunForWorkspace(workspaceId);
      if (currentRun) {
        return NextResponse.json({ data: currentRun });
      }
    } catch (dbError) {
      console.log('Database query failed:', dbError);
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
    return NextResponse.json({ data: mockRun });
  } catch (error: any) {
    console.error('Error getting current run:', error);
    return NextResponse.json(
      { error: 'Failed to get current run' },
      { status: 500 }
    );
  }
}, { route: '/api/brand-run/current' })
