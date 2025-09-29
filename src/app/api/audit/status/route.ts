import { NextRequest, NextResponse } from 'next/server';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { AuditStatus } from '@/types/audit';

export async function GET(request: NextRequest) {
  try {
    // Resolve workspace using server helper - same as run route
    const { workspaceId } = await requireSessionOrDemo(request);
    
    if (!workspaceId) {
      return NextResponse.json(
        { ok: false, error: 'NO_WORKSPACE' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const isDiag = searchParams.get('diag') === '1';

    if (!jobId) {
      return NextResponse.json(
        { ok: false, error: 'MISSING_JOB_ID' },
        { status: 400 }
      );
    }

    // Log status check
    log.info({ 
      route: '/api/audit/status', 
      workspaceId,
      jobId,
      diag: isDiag
    }, 'audit route');

    // Find Audit by jobId in snapshotJson
    const audit = await prisma().audit.findFirst({
      where: {
        workspaceId,
        snapshotJson: {
          path: ['jobId'],
          equals: jobId
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!audit) {
      return NextResponse.json(
        { ok: false, error: 'JOB_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Extract status from snapshotJson
    const snapshot = audit.snapshotJson as any;
    const status = snapshot?.status || 'queued';
    const auditId = audit.id;

    // For demo purposes, if status is 'running', mark as 'succeeded' after a delay
    // In real implementation, this would be updated by the actual worker
    let finalStatus = status;
    if (status === 'running') {
      // Simulate completion after some time
      const createdAt = new Date(audit.createdAt);
      const now = new Date();
      const elapsed = now.getTime() - createdAt.getTime();
      
      if (elapsed > 5000) { // 5 seconds
        finalStatus = 'succeeded';
        // Update the audit row
        await prisma().audit.update({
          where: { id: auditId },
          data: {
            snapshotJson: {
              ...snapshot,
              status: 'succeeded' as AuditStatus,
              metadata: {
                ...snapshot?.metadata,
                completedAt: new Date().toISOString()
              }
            }
          }
        });
      }
    }

    const response: any = {
      ok: true,
      jobId,
      status: finalStatus,
      auditId
    };

    if (isDiag) {
      // Get latest audit for this workspace
      const latestAudit = await prisma().audit.findFirst({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        select: { id: true }
      });

      response.workspaceId = workspaceId;
      response.lastAuditId = latestAudit?.id;
    }

    return NextResponse.json(response);
  } catch (error: any) {
    log.error({ error }, 'Error getting job status');
    
    // Handle auth errors specifically
    if (error.message === 'UNAUTHENTICATED') {
      return NextResponse.json(
        { ok: false, error: 'UNAUTHENTICATED' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// Return 405 for non-GET methods
export async function POST() {
  return NextResponse.json(
    { ok: false, error: 'METHOD_NOT_ALLOWED' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { ok: false, error: 'METHOD_NOT_ALLOWED' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { ok: false, error: 'METHOD_NOT_ALLOWED' },
    { status: 405 }
  );
}
