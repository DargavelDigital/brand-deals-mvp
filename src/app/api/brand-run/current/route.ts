import { NextRequest, NextResponse } from 'next/server';
import { ensureWorkspace } from '@/lib/workspace';
import { getCurrentRunForWorkspace } from '@/services/orchestrator/brandRunHelper';
import { safe } from '@/lib/api/safeHandler';

export const GET = safe(async (request: NextRequest) => {
  try {
    const workspaceId = await ensureWorkspace();
    
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
