import { NextRequest, NextResponse } from 'next/server';
import { recordStepResult } from '@/services/orchestrator/brandRunHelper';

export async function POST(request: NextRequest) {
  try {
    const { runId, payload } = await request.json();

    if (!runId) {
      return NextResponse.json(
        { error: 'runId is required' },
        { status: 400 }
      );
    }

    if (!payload) {
      return NextResponse.json(
        { error: 'payload is required' },
        { status: 400 }
      );
    }

    await recordStepResult(runId, payload);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording step result:', error);
    return NextResponse.json(
      { error: 'Failed to record step result' },
      { status: 500 }
    );
  }
}
