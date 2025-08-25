import { NextRequest, NextResponse } from 'next/server';
import { getCurrentRunForWorkspace } from '@/services/orchestrator/brandRunHelper';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId is required' },
        { status: 400 }
      );
    }

    const currentRun = await getCurrentRunForWorkspace(workspaceId);
    
    return NextResponse.json({ run: currentRun });
  } catch (error: any) {
    console.error('Error getting current run:', error);
    return NextResponse.json(
      { error: 'Failed to get current run' },
      { status: 500 }
    );
  }
}
