import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';

export async function POST(req: NextRequest) {
  const { workspaceId } = await requireSessionOrDemo(req);
  const { jobId, mapping } = await req.json();
  const job = await prisma.importJob.findFirst({ where: { id: jobId, workspaceId }});
  if (!job) return NextResponse.json({ ok:false, error:'NOT_FOUND' }, { status:404 });

  await prisma.importJob.update({ where: { id: jobId }, data: { status: 'MAPPING', summaryJson: { path: ['mapping'], set: mapping } as any }});
  return NextResponse.json({ ok:true });
}
