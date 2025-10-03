import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-options';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    console.log('[agency][debug] Starting debug...');
    
    // Test session
    const session = await getServerSession(authOptions);
    console.log('[agency][debug] Session:', !!session, session?.user?.email);
    
    if (!session) {
      return NextResponse.json({ 
        ok: false, 
        error: 'UNAUTHENTICATED',
        debug: { session: false }
      }, { status: 401 });
    }

    const workspaceId = (session.user as any)?.workspaceId;
    console.log('[agency][debug] WorkspaceId:', workspaceId);
    
    if (!workspaceId) {
      return NextResponse.json({ 
        ok: false, 
        error: 'NO_WORKSPACE',
        debug: { session: true, workspaceId: false }
      }, { status: 400 });
    }

    // Test database connection
    console.log('[agency][debug] Testing database connection...');
    const dbTest = await prisma().user.findFirst({
      select: { id: true, email: true }
    });
    console.log('[agency][debug] Database test result:', !!dbTest);

    // Test membership query
    console.log('[agency][debug] Testing membership query...');
    const memberships = await prisma().membership.findMany({
      where: { 
        workspaceId,
        role: { in: ['OWNER', 'MANAGER'] }
      },
      select: {
        id: true,
        role: true,
        createdAt: true,
        workspace: { select: { id: true, name: true } },
        user: { select: { id: true, email: true } }
      },
      orderBy: { createdAt: "desc" },
    });
    console.log('[agency][debug] Memberships found:', memberships.length);

    return NextResponse.json({ 
      ok: true, 
      debug: {
        session: true,
        workspaceId,
        databaseConnected: !!dbTest,
        membershipsCount: memberships.length,
        memberships: memberships.map(m => ({
          id: m.workspace.id,
          name: m.workspace.name,
          role: m.role.toLowerCase(),
          addedAt: m.createdAt.toISOString(),
        }))
      }
    });
  } catch (err: any) {
    console.error('[agency][debug] ERROR:', err);
    return NextResponse.json({ 
      ok: false, 
      error: 'INTERNAL_ERROR',
      debug: {
        message: err?.message,
        code: err?.code,
        stack: err?.stack?.split('\n').slice(0, 5)
      }
    }, { status: 500 });
  }
}
