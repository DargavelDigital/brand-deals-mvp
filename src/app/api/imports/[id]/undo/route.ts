import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(req: NextRequest, { params }: { params: { id: string }}) {
  const { workspaceId } = await requireSessionOrDemo(req);
  const job = await prisma().importJob.findFirst({ where: { id: params.id, workspaceId }});
  if (!job?.summaryJson) return NextResponse.json({ ok:false, error:'NO_SUMMARY' }, { status:400 });

  const created = (job.summaryJson as any).createdIds ?? {};
  if (created.contacts?.length) await prisma().contact.deleteMany({ where: { id: { in: created.contacts } }});
  if (created.brands?.length) await prisma().brand.deleteMany({ where: { id: { in: created.brands } }});
  if (created.deals?.length) await prisma().deal.deleteMany({ where: { id: { in: created.deals } }});

  await prisma().importJob.update({ where: { id: job.id }, data: { status: 'COMPLETED', summaryJson: { path:['undone'], set: true } as any }});
  return NextResponse.json({ ok:true });
}
