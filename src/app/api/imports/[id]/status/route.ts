import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSessionOrDemo } from '@/lib/authz';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { workspaceId } = await requireSessionOrDemo(_req);
  const job = await prisma.importJob.findFirst({ where: { id: params.id, workspaceId }});
  if (!job) return NextResponse.json({ ok:false, error:'NOT_FOUND' }, { status:404 });
  return NextResponse.json({ ok:true, job });
}
