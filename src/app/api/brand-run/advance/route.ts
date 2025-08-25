import { NextRequest, NextResponse } from 'next/server';
import { updateRunStep } from '@/services/orchestrator/brandRunHelper';
import { RunStep } from '@/services/orchestrator/brandRun';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, step } = body;

    if (!workspaceId || !step) {
      return NextResponse.json(
        { error: 'workspaceId and step are required' },
        { status: 400 }
      );
    }

    // Validate step
    const validSteps: RunStep[] = ['CONNECT', 'AUDIT', 'MATCHES', 'APPROVE', 'PACK', 'CONTACTS', 'OUTREACH', 'COMPLETE'];
    if (!validSteps.includes(step)) {
      return NextResponse.json(
        { error: 'Invalid step' },
        { status: 400 }
      );
    }

    await updateRunStep(workspaceId, step);
    
    return NextResponse.json({ success: true, step });
  } catch (error: any) {
    console.error('Error advancing brand run:', error);
    return NextResponse.json(
      { error: 'Failed to advance brand run' },
      { status: 500 }
    );
  }
}
