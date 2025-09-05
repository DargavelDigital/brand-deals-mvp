import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';
import { log } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    log.info('[debug/whoami] GET /api/debug/whoami');
    
    // Get cookie workspace ID
    const jar = cookies();
    const wsidCookie = jar.get('wsid')?.value;
    const cookieWsid = wsidCookie || null;
    
    // Get server workspace ID via auth
    let serverWorkspaceId: string | null = null;
    let user: string | null = null;
    
    try {
      const { workspaceId, user: authUser } = await requireSessionOrDemo(request);
      serverWorkspaceId = workspaceId;
      user = authUser?.email || authUser?.id || null;
    } catch (e) {
      log.warn({ e }, '[debug/whoami] failed to get server workspace ID');
    }
    
    log.info({ 
      cookieWsid, 
      serverWorkspaceId 
    }, '[debug/whoami] workspace resolution');
    
    return NextResponse.json({
      ok: true,
      cookieWsid,
      serverWorkspaceId,
      user
    });
    
  } catch (err) {
    log.error({ err }, '[debug/whoami] unhandled error');
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
