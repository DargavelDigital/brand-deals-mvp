import { NextRequest, NextResponse } from 'next/server';
import { withIdempotency } from '@/lib/idempotency';
import { runWeeklyMatchRefresh } from '@/jobs/matchRefresh';
import { env } from '@/lib/env';
import { log } from '@/lib/log';

export const runtime = 'nodejs';

export const POST = withIdempotency(async (req: NextRequest) => {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization');
    const expectedSecret = env.CRON_SECRET;
    
    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Run weekly match refresh
    await runWeeklyMatchRefresh();
    
    return NextResponse.json({ 
      ok: true, 
      message: 'Weekly match refresh completed',
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    log.error('Weekly match refresh cron failed:', error);
    return NextResponse.json(
      { error: 'Match refresh failed', details: error.message },
      { status: 500 }
    );
  }
});
