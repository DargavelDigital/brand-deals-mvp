import { NextResponse } from 'next/server'

import { withIdempotency } from '@/lib/idempotency';
export const POST = withIdempotency(async () => {
  return NextResponse.json(
    {
      error: 'NOT_IMPLEMENTED',
      message: 'Push notifications are not yet implemented',
      service: 'push',
      status: 'coming_soon'
    },
    { status: 501 }
  )
});
