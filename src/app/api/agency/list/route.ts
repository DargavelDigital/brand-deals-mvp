import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/getAuth';
import { randomUUID } from 'crypto';

export async function GET() {
  const traceId = randomUUID();
  const guard = await requireAuth(['OWNER','MANAGER']);
  if (!guard.ok) {
    return NextResponse.json({ ok: false, error: guard.error, traceId }, { status: guard.status });
  }
  const { ctx } = guard;

  try {
    const managers = await prisma.membership.findMany({
      where: { workspaceId: ctx.workspaceId, role: { in: ['MANAGER', 'OWNER'] } },
      include: { user: true },
      orderBy: { role: 'desc' },
    });
    const items = managers.map(m => ({
      id: m.userId,
      email: m.user.email,
      name: m.user.name,
      role: m.role,
    }));
    return NextResponse.json({ ok: true, items, traceId });
  } catch (e) {
    console.error('[agency/list]', traceId, e);
    return NextResponse.json({ ok: false, error: 'LIST_FAILED', traceId }, { status: 500 });
  }
}
