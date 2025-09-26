import { NextResponse } from 'next/server';
import { withIdempotency } from '@/lib/idempotency';
import { runAndSaveEval } from '@/ai/evals/scores';
import { log } from '@/lib/log';

export const POST = withIdempotency(async () => {
  try {
    log.info('🚀 API: Starting AI evaluation...');
    
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
    log.error('[evals/run] Error:', error);
    return NextResponse.json(
      { 
        ok: false, 
        error: 'Failed to run evaluation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
});
