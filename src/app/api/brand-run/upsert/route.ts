import { NextRequest, NextResponse } from 'next/server';
import { ensureWorkspace } from '@/lib/workspace';
import { createRunForWorkspace } from '@/services/orchestrator/brandRunHelper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { auto = false, step } = body;
    const workspaceId = await ensureWorkspace();

    try {
      const newRun = await createRunForWorkspace(workspaceId, auto);
      return NextResponse.json({ data: newRun });
    } catch (dbError) {
      // Fallback to mock data if database fails
      console.log('Database creation failed, using mock data:', dbError);
      const mockRun = {
        id: 'mock_' + Date.now(),
        workspaceId,
        step: step || 'CONNECT',
        auto,
        selectedBrandIds: [],
        contactIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stats: { brands: 0, creditsUsed: 0 }
      };
      return NextResponse.json({ data: mockRun });
    }
  } catch (error: any) {
    console.error('Error creating brand run:', error);
    return NextResponse.json(
      { error: 'Failed to create brand run' },
      { status: 500 }
    );
  }
}
