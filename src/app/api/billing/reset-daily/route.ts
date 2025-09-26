import { NextResponse } from 'next/server'
import { withIdempotency } from '@/lib/idempotency';
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const POST = withIdempotency(async () => {
  await prisma.workspace.updateMany({ data: { emailDailyUsed: 0 } })
  return NextResponse.json({ ok: true })
});
