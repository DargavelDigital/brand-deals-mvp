import { NextRequest, NextResponse } from 'next/server';
import { getLatestAudit } from '@/services/audit';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';

export async function GET(request: NextRequest) {
  try {
    // Enforce auth - return JSON error instead of redirect
    const { workspaceId: authWorkspaceId } = await requireSessionOrDemo(request);
    
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    // Use authenticated workspace ID if not provided in query params
    const effectiveWorkspaceId = workspaceId || authWorkspaceId;

    if (!effectiveWorkspaceId) {
      return NextResponse.json(
        { ok: false, error: 'NO_WORKSPACE' },
        { status: 400 }
      );
    }

    const latestAudit = await getLatestAudit(effectiveWorkspaceId);
    
    return NextResponse.json({ ok: true, audit: latestAudit });
  } catch (error: any) {
    console.error('Error getting latest audit:', error);
    
    // Handle auth errors specifically
    if (error.message === 'UNAUTHENTICATED') {
      return NextResponse.json(
        { ok: false, error: 'UNAUTHENTICATED' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { ok: false, error: 'Failed to get latest audit' },
      { status: 500 }
    );
  }
}
