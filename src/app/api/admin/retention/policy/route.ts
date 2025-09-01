import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/requireSession';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const gate = await requireSession(req);
  if (!gate.ok) return gate.res;
  const session = gate.session!;

  // Check if user is admin/owner
  const membership = await prisma.membership.findFirst({
    where: { 
      workspaceId: (session.user as any).workspaceId, 
      userId: (session.user as any).id,
      role: { in: ['OWNER', 'ADMIN'] }
    }
  });

  if (!membership) {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  const policy = await prisma.retentionPolicy.findUnique({ where: { workspaceId: (session.user as any).workspaceId }});
  return NextResponse.json({ ok: true, policy });
}

export async function POST(req: NextRequest) {
  const gate = await requireSession(req);
  if (!gate.ok) return gate.res;
  const session = gate.session!;

  // Check if user is admin/owner
  const membership = await prisma.membership.findFirst({
    where: { 
      workspaceId: (session.user as any).workspaceId, 
      userId: (session.user as any).id,
      role: { in: ['OWNER', 'ADMIN'] }
    }
  });

  if (!membership) {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  const body = await req.json();
  const policy = await prisma.retentionPolicy.upsert({
    where: { workspaceId: (session.user as any).workspaceId },
    create: { workspaceId: (session.user as any).workspaceId, ...body },
    update: { ...body }
  });

  // Log the policy update
  await prisma.adminActionLog.create({
    data: {
      workspaceId: (session.user as any).workspaceId,
      userId: (session.user as any).id ?? null,
      action: 'retention.policy.updated',
      details: body
    }
  });

  return NextResponse.json({ ok: true, policy });
}
