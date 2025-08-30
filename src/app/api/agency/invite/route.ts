import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/getAuth';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  const traceId = randomUUID();
  const guard = await requireAuth(['OWNER']);
  if (!guard.ok) return NextResponse.json({ ok:false, error: guard.error, traceId }, { status: guard.status });
  const { ctx } = guard;

  try {
    const { email, name } = await req.json();
    if (!email) return NextResponse.json({ ok:false, error:'EMAIL_REQUIRED', traceId }, { status: 400 });

    let user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      user = await prisma.user.create({ data: { email, name: name ?? null } });
    }
    await prisma.membership.upsert({
      where: { userId_workspaceId: { userId: user.id, workspaceId: ctx.workspaceId } },
      update: { role: 'MANAGER' },
      create: { userId: user.id, workspaceId: ctx.workspaceId, role: 'MANAGER' },
    });

    // TODO: send invite email
    return NextResponse.json({ ok: true, userId: user.id, traceId });
  } catch (e) {
    console.error('[agency/invite]', traceId, e);
    return NextResponse.json({ ok:false, error:'INVITE_FAILED', traceId }, { status: 500 });
  }
}
