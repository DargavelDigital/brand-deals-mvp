import { NextResponse } from 'next/server';
import { runAndSaveEval } from '@/ai/evals/scores';

export async function POST() {
  try {
    console.log('🚀 API: Starting AI evaluation...');
    
    const { evalSummary, alerts } = await runAndSaveEval();
    
    return NextResponse.json({
      ok: true,
      data: {
        evalSummary,
        alerts,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[evals/run] Error:', error);
    return NextResponse.json(
      { 
        ok: false, 
        error: 'Failed to run evaluation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
