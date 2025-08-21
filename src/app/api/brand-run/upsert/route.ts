import { NextRequest, NextResponse } from 'next/server';
import { upsertRunForWorkspace } from '@/services/orchestrator/brandRunHelper';

export async function POST(request: NextRequest) {
  try {
    const { workspaceId, auto } = await request.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId is required' },
        { status: 400 }
      );
    }

    const run = await upsertRunForWorkspace({ workspaceId, auto });

    return NextResponse.json({ run });
  } catch (error) {
    console.error('Error upserting brand run:', error);
    return NextResponse.json(
      { error: 'Failed to upsert brand run' },
      { status: 500 }
    );
  }
}
