import { NextRequest, NextResponse } from 'next/server';
import { withIdempotency } from '@/lib/idempotency';
import { prisma } from '@/lib/prisma';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const POST = withIdempotency(async (req: NextRequest) => {
  const { workspaceId } = await requireSessionOrDemo(req);
  const { jobId, mapping } = await req.json();
  const job = await prisma.importJob.findFirst({ where: { id: jobId, workspaceId }});
  if (!job) return NextResponse.json({ ok:false, error:'NOT_FOUND' }, { status:404 });

  await prisma.importJob.update({ where: { id: jobId }, data: { status: 'MAPPING', summaryJson: { path: ['mapping'], set: mapping } as any }});
  return NextResponse.json({ ok:true });
});
