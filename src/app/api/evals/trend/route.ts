import { NextResponse } from 'next/server';
import { getEvalTrend } from '@/ai/evals/scores';

export async function GET() {
  try {
    const trend = await getEvalTrend();
    
    return NextResponse.json({
      ok: true,
      data: trend,
      count: trend.length
    });
  } catch (error) {
    console.error('[evals/trend] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch evaluation trend' },
      { status: 500 }
    );
  }
}
