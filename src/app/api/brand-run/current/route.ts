import { NextRequest, NextResponse } from 'next/server';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';
import { getCurrentRunForWorkspace } from '@/services/orchestrator/brandRunHelper';
import { safe } from '@/lib/api/safeHandler';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

async function resolveWorkspaceId(): Promise<string> {
  try {
    // Try to get workspace from session/demo first
    const workspaceId = await requireSessionOrDemo({} as NextRequest);
    return workspaceId;
  } catch (error) {
    log.warn('Failed to get workspace from session:', error);
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
    log.error('Failed to create demo workspace:', error);
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
      log.info('Database query failed:', dbError);
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
    log.error('Error getting current run:', error);
    return NextResponse.json(
      { error: 'Failed to get current run' },
      { status: 500 }
    );
  }
}, { route: '/api/brand-run/current' })
