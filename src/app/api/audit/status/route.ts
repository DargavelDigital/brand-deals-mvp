import { NextRequest, NextResponse } from 'next/server';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';

export async function GET(request: NextRequest) {
  try {
    // Enforce auth - return JSON error instead of redirect
    const { workspaceId } = await requireSessionOrDemo(request);
    
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { ok: false, error: 'INVALID_JOB' },
        { status: 400 }
      );
    }

    // For now, since we don't have a Job model, we'll return a simple status
    // In a real implementation, you would query the job status from database
    // For inline mode, this endpoint might not be needed as results are immediate
    
    // Mock job status response - replace with actual job lookup
    const jobStatus = {
      jobId,
      status: 'succeeded' as const, // 'queued' | 'running' | 'succeeded' | 'failed'
      auditId: undefined as string | undefined,
      errorMessage: undefined as string | undefined
    };

    return NextResponse.json({
      ok: true,
      ...jobStatus
    });
  } catch (error: any) {
    console.error('Error getting job status:', error);
    
    // Handle auth errors specifically
    if (error.message === 'UNAUTHENTICATED') {
      return NextResponse.json(
        { ok: false, error: 'UNAUTHENTICATED' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { ok: false, error: 'Failed to get job status' },
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
