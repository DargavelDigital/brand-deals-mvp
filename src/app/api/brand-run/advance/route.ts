import { NextRequest, NextResponse } from 'next/server';
import { advanceTo } from '@/services/orchestrator/brandRunHelper';

export async function POST(request: NextRequest) {
  try {
    const { nextStep, runId, workspaceId } = await request.json();

    if (!nextStep) {
      return NextResponse.json(
        { error: 'nextStep is required' },
        { status: 400 }
      );
    }

    if (!runId && !workspaceId) {
      return NextResponse.json(
        { error: 'Either runId or workspaceId must be provided' },
        { status: 400 }
      );
    }

    const run = await advanceTo(nextStep, runId, { workspaceId });

    return NextResponse.json({ run });
  } catch (error) {
    console.error('Error advancing brand run:', error);
    
    // Check if it's a prerequisite error
    if (error instanceof Error && error.message.includes('Cannot advance')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to advance brand run' },
      { status: 500 }
    );
  }
}
