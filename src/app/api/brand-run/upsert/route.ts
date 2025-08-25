import { NextRequest, NextResponse } from 'next/server';
import { createRunForWorkspace } from '@/services/orchestrator/brandRunHelper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, auto = false } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId is required' },
        { status: 400 }
      );
    }

    const newRun = await createRunForWorkspace(workspaceId, auto);
    
    return NextResponse.json({ run: newRun });
  } catch (error: any) {
    console.error('Error creating brand run:', error);
    return NextResponse.json(
      { error: 'Failed to create brand run' },
      { status: 500 }
    );
  }
}
