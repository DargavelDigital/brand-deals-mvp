import { NextRequest, NextResponse } from 'next/server';
import { withIdempotency } from '@/lib/idempotency';
import { prisma } from '@/lib/prisma';
import { isOn } from '@/config/flags';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const POST = withIdempotency(async (req: NextRequest) => {
  if (!isOn('netfx.playbooks.enabled')) return NextResponse.json({ ok:false }, { status: 404 });
  const { industry, sizeBand, region, season } = await req.json();
  const pb = await prisma.playbook.findFirst({
    where: { industry, sizeBand, region, season },
    orderBy: { version: 'desc' }
  });
  if (!pb) return NextResponse.json({ ok:false }, { status: 404 });
  return NextResponse.json({ ok:true, playbook: pb });
});
