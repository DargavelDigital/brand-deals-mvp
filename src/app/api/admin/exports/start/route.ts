import { NextRequest, NextResponse } from 'next/server';
import { withTrace } from '@/middleware/withTrace';
import { requireSession } from '@/lib/auth/requireSession';
import { isOn } from '@/config/flags';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma');
    const session = await requireSession(req);
    if (session instanceof NextResponse) return session;

    // Check if user is admin/owner
    const membership = await prisma().membership.findFirst({
      where: { 
        workspaceId: (session.user as any).workspaceId, 
        userId: (session.user as any).id,
        role: { in: ['OWNER', 'MANAGER'] }
      }
    });

    if (!membership) {
      return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
    }

    const { kind = 'workspace.full' } = await req.json().catch(()=>({}));

    const job = await prisma().exportJob.create({
      data: { workspaceId: (session.user as any).workspaceId, kind, status: 'QUEUED', requestedBy: (session.user as any).id ?? null }
    });

    // Log the export request
    await prisma().adminActionLog.create({
      data: {
        workspaceId: (session.user as any).workspaceId,
        userId: (session.user as any).id ?? null,
        action: 'export.started',
        details: { jobId: job.id, kind },
        traceId: (req as any).traceId
      }
    });

    return NextResponse.json({ ok: true, jobId: job.id });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }
}
