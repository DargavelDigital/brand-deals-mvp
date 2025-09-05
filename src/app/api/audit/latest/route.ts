import { NextRequest, NextResponse } from 'next/server';
import { getLatestAudit } from '@/services/audit';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';
import { cookies } from 'next/headers';
import { log } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryWorkspaceId = searchParams.get('workspaceId');
    const provider = searchParams.get('provider');
    
    log.info({ 
      queryWorkspaceId, 
      provider 
    }, '[audit/latest] GET /api/audit/latest');
    
    // Resolve workspaceId in priority order:
    // 1. searchParams.get('workspaceId') if non-empty
    // 2. wsid cookie
    // 3. server resolver (requireSessionOrDemo)
    let effectiveWorkspaceId: string | null = null;
    let resolutionMethod = 'none';
    
    if (queryWorkspaceId && queryWorkspaceId.trim() !== '') {
      effectiveWorkspaceId = queryWorkspaceId;
      resolutionMethod = 'query_param';
    } else {
      // Try wsid cookie
      const jar = cookies();
      const wsidCookie = jar.get('wsid')?.value;
      if (wsidCookie && wsidCookie.trim() !== '') {
        effectiveWorkspaceId = wsidCookie;
        resolutionMethod = 'wsid_cookie';
      } else {
        // Fall back to server resolver
        try {
          const { workspaceId: authWorkspaceId } = await requireSessionOrDemo(request);
          effectiveWorkspaceId = authWorkspaceId;
          resolutionMethod = 'auth_session';
        } catch (e) {
          log.warn({ e }, '[audit/latest] failed to get workspace from auth session');
        }
      }
    }

    if (!effectiveWorkspaceId) {
      log.warn('[audit/latest] no workspace ID found via any method');
      return NextResponse.json(
        { ok: false, error: 'NO_WORKSPACE' },
        { status: 400 }
      );
    }

    log.info({ 
      effectiveWorkspaceId, 
      resolutionMethod, 
      provider 
    }, '[audit/latest] workspace resolution complete');

    const latestAudit = await getLatestAudit(effectiveWorkspaceId);
    
    return NextResponse.json({ ok: true, audit: latestAudit });
  } catch (error: any) {
    log.error({ error }, '[audit/latest] unhandled error');
    
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
