import { NextRequest, NextResponse } from 'next/server';
import { withTrace } from '@/middleware/withTrace';
import { getAuth } from '@/lib/auth/getAuth';
import { prisma } from '@/lib/prisma';
import { isOn } from '@/config/flags';

export const POST = withTrace(async (req: NextRequest) => {
  if (!isOn('exports.enabled')) return NextResponse.json({ ok:false }, { status: 404 });
  
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

  const { kind = 'workspace.full' } = await req.json().catch(()=>({}));

  const job = await prisma.exportJob.create({
    data: { workspaceId: auth.workspaceId, kind, status: 'QUEUED', requestedBy: auth.user.id ?? null }
  });

  // Log the export request
  await prisma.adminActionLog.create({
    data: {
      workspaceId: auth.workspaceId,
      userId: auth.user.id ?? null,
      action: 'export.started',
      details: { jobId: job.id, kind },
      traceId: (req as any).traceId
    }
  });

  return NextResponse.json({ ok: true, jobId: job.id });
});
