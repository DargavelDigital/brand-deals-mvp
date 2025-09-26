import { NextRequest, NextResponse } from 'next/server';
import { withIdempotency } from '@/lib/idempotency';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';
import { getCalendar } from '@/services/calendar';

export const POST = withIdempotency(async (req: NextRequest) => {
  const { workspaceId } = await requireSessionOrDemo(req);
  const { durationMin=30, count=5 } = await req.json();
  const cal = await getCalendar(workspaceId);
  const slots = await cal.proposeSlots(durationMin, count);
  return NextResponse.json({ ok:true, slots });
});
