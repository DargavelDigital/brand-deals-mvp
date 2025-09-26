import { NextRequest, NextResponse } from 'next/server';
import { withIdempotency } from '@/lib/idempotency';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';
import { getCalendar } from '@/services/calendar';

export const POST = withIdempotency(async (req: NextRequest) => {
  const { workspaceId } = await requireSessionOrDemo(req);
  const { slot, attendees, title, description } = await req.json();
  const cal = await getCalendar(workspaceId);
  const result = await cal.book(slot, attendees, title, description);
  return NextResponse.json({ ok:true, ...result });
});
