import { NextRequest, NextResponse } from 'next/server'
import { withIdempotency } from '@/lib/idempotency';
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/auth/requireSession'
import { isOn } from '@/config/flags'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession(req);
    if (session instanceof NextResponse) return session;
  } catch (e) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const tasks = await prisma.contactTask.findMany({
    where: { workspaceId: (session.user as any).workspaceId, contactId: params.id },
    orderBy: [{ status: 'asc' }, { dueAt: 'asc' }]
  })
  return NextResponse.json({ items: tasks })
}

export const POST = withIdempotency(async (req: NextRequest, { params }: { params: { id: string } }) => {
  if (!isOn('crm.light.enabled')) return NextResponse.json({ error: 'OFF' }, { status: 404 })
  
  const gate = await requireSession(req);
  if (!gate.ok) return gate.res;
  const session = gate.session!;
  
  const body = await req.json()
  const item = await prisma.contactTask.create({
    data: {
      workspaceId: (session.user as any).workspaceId,
      contactId: params.id,
      title: String(body.title ?? 'Follow up'),
      dueAt: body.dueAt ? new Date(body.dueAt) : null,
      notes: body.notes ?? null
    }
  })
  return NextResponse.json({ item })
});

export const PUT = withIdempotency(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const gate = await requireSession(req);
  if (!gate.ok) return gate.res;
  const session = gate.session!;
  
  const body = await req.json()
  const item = await prisma.contactTask.update({
    where: { id: String(body.id) },
    data: {
      title: body.title,
      dueAt: body.dueAt ? new Date(body.dueAt) : undefined,
      status: body.status,
      notes: body.notes
    }
  })
  return NextResponse.json({ item })
});
