import { NextRequest, NextResponse } from 'next/server';
import { withIdempotency } from '@/lib/idempotency';
import { requireSession } from '@/lib/auth/requireSession';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

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

export const POST = withIdempotency(async (req: NextRequest) => {
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

  const { enabled, auditsDays, outreachDays, logsDays, contactsDays, mediaPacksDays } = await req.json();

  // Update or create retention policy
  const policy = await prisma.retentionPolicy.upsert({
    where: { workspaceId: (session.user as any).workspaceId },
    update: { enabled, auditsDays, outreachDays, logsDays, contactsDays, mediaPacksDays },
    create: { 
      workspaceId: (session.user as any).workspaceId, 
      enabled, 
      auditsDays, 
      outreachDays, 
      logsDays, 
      contactsDays, 
      mediaPacksDays 
    }
  });

  // Log the policy update
  await prisma.adminActionLog.create({
    data: {
      workspaceId: (session.user as any).workspaceId,
      userId: (session.user as any).id ?? null,
      action: 'retention.policy.updated',
      details: policy
    }
  });

  return NextResponse.json({ ok: true, policy });
});
