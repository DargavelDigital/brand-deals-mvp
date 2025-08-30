import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/getAuth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = await getAuth(true);
  if (!auth) {
    return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
  }

  // Check if user is admin/owner
  const membership = await prisma.membership.findFirst({
    where: { 
      workspaceId: auth.workspaceId, 
      userId: auth.user.id,
      role: { in: ['OWNER', 'ADMIN'] }
    }
  });

  if (!membership) {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  const policy = await prisma.retentionPolicy.findUnique({ where: { workspaceId: auth.workspaceId }});
  return NextResponse.json({ ok: true, policy });
}

export async function POST(req: NextRequest) {
  const auth = await getAuth(true);
  if (!auth) {
    return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
  }

  // Check if user is admin/owner
  const membership = await prisma.membership.findFirst({
    where: { 
      workspaceId: auth.workspaceId, 
      userId: auth.user.id,
      role: { in: ['OWNER', 'ADMIN'] }
    }
  });

  if (!membership) {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  const body = await req.json();
  const policy = await prisma.retentionPolicy.upsert({
    where: { workspaceId: auth.workspaceId },
    create: { workspaceId: auth.workspaceId, ...body },
    update: { ...body }
  });

  // Log the policy update
  await prisma.adminActionLog.create({
    data: {
      workspaceId: auth.workspaceId,
      userId: auth.user.id ?? null,
      action: 'retention.policy.updated',
      details: body
    }
  });

  return NextResponse.json({ ok: true, policy });
}
