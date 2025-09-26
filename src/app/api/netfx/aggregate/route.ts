import { NextRequest, NextResponse } from 'next/server';
import { withIdempotency } from '@/lib/idempotency';
import { runAggregation } from '@/services/netfx/aggregate';
import { isOn } from '@/config/flags';

export const POST = withIdempotency(async (_: NextRequest) => {
  if (!isOn('netfx.enabled')) return NextResponse.json({ ok:false }, { status: 404 });
  await runAggregation();
  return NextResponse.json({ ok:true });
});
