import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-options';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    
    // Get session/workspace
    const session = await getServerSession(authOptions);
    const workspaceId = session?.user?.workspaceId;
    
    if (!workspaceId) {
      return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
    }
    
    // Query audit job status from database
    const job = await prisma().auditJob.findUnique({
      where: { 
        id: jobId, 
        workspaceId // Security: ensure user can only access their workspace's jobs
      }
    });
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    // Log status check
    log.info({ 
      route: '/api/audit/status/[jobId]', 
      workspaceId,
      jobId,
      status: job.status,
      progress: job.progress
    }, 'audit status check');
    
    return NextResponse.json({
      status: job.status,      // 'queued' | 'processing' | 'complete' | 'failed'
      progress: job.progress,  // 0-100
      stage: job.stage,        // Human-readable stage
      error: job.error,        // If failed
      auditId: job.auditId     // If complete
    });
    
  } catch (error: any) {
    log.error({ error, jobId: params.jobId }, 'Error getting audit job status');
    
    return NextResponse.json(
      { error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// Return 405 for non-GET methods
export async function POST() {
  return NextResponse.json(
    { error: 'METHOD_NOT_ALLOWED' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'METHOD_NOT_ALLOWED' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'METHOD_NOT_ALLOWED' },
    { status: 405 }
  );
}
