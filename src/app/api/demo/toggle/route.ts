import { NextRequest, NextResponse } from 'next/server';
import { withIdempotency } from '@/lib/idempotency';
import { log } from '@/lib/log';

export const POST = withIdempotency(async (request: NextRequest) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { enabled } = body;

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'enabled must be a boolean' },
        { status: 400 }
      );
    }

    // In a real app, you might store this in a database or session
    // For now, we'll just return success
    log.info(`Demo mode ${enabled ? 'enabled' : 'disabled'}`);
    
    return NextResponse.json({ 
      success: true, 
      demoMode: enabled 
    });
  } catch (error: any) {
    log.error('Error toggling demo mode:', error);
    return NextResponse.json(
      { error: 'Failed to toggle demo mode' },
      { status: 500 }
    );
  }
});
