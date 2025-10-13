import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-options';
import { db } from '@/lib/prisma';
import { Role } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });

    const u = new URL(req.url);
    
    // Get workspaceId from query params OR auto-detect from user's membership
    let workspaceId = u.searchParams.get('workspaceId');
    
    if (!workspaceId && session.user?.id) {
      // Auto-detect workspaceId from user's first membership
      try {
        const membership = await db().membership.findFirst({
          where: { 
            userId: session.user.id,
            role: { in: ['OWNER', 'MANAGER', 'MEMBER'] }
          },
          select: { workspaceId: true },
          orderBy: { createdAt: 'asc' } // Get oldest (likely main workspace)
        });
        
        if (membership) {
          workspaceId = membership.workspaceId;
          console.log('✅ Auto-detected workspaceId from membership:', workspaceId);
        }
      } catch (error) {
        console.error('Failed to fetch membership:', error);
      }
    }
    
    // Diagnostic mode
    if (u.searchParams.get('diag') === '1') {
      return NextResponse.json({
        ok: true,
        user: session.user?.email ?? null,
        workspaceId: workspaceId ?? null,
      });
    }

    if (!workspaceId) {
      return NextResponse.json({ ok: false, error: 'NO_WORKSPACE' }, { status: 400 });
    }

    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ ok: true, items: [] });
    }

    const memberships = await db().membership.findMany({
      where: { 
        workspaceId,
        role: { in: ['OWNER', 'MANAGER'] }
      },
      select: {
        id: true,
        role: true,
        createdAt: true,
        Workspace: { select: { id: true, name: true } },
        User_Membership_userIdToUser: { select: { id: true, email: true } }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ 
      ok: true, 
      items: memberships.map(m => ({
        id: m.Workspace.id,
        name: m.Workspace.name,
        role: m.role.toLowerCase(),
        addedAt: m.createdAt.toISOString(),
      }))
    });
  } catch (err) {
    console.error('[agency][list] INTERNAL_ERROR', err);
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });

    // Get workspaceId from query params OR auto-detect from user's membership
    const u = new URL(req.url);
    let workspaceId = u.searchParams.get('workspaceId');
    
    if (!workspaceId && session.user?.id) {
      const membership = await db().membership.findFirst({
        where: { 
          userId: session.user.id,
          role: { in: ['OWNER', 'MANAGER', 'MEMBER'] }
        },
        select: { workspaceId: true },
        orderBy: { createdAt: 'asc' }
      });
      
      if (membership) {
        workspaceId = membership.workspaceId;
      }
    }
    
    if (!workspaceId) {
      return NextResponse.json({ ok: false, error: 'NO_WORKSPACE' }, { status: 400 });
    }

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ ok: false, error: 'UNSUPPORTED_MEDIA_TYPE' }, { status: 415 });
    }

    const raw = await req.text();
    let data: unknown = null;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      return NextResponse.json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
    }

    const body = data as { userId?: string; role?: string };
    const { userId, role = 'MEMBER' } = body;
    const roleEnum = role as Role;

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'BAD_REQUEST', message: 'userId is required' }, { status: 400 });
    }

    // For demo mode, return mock response
    if (workspaceId === 'demo-workspace') {
      return NextResponse.json({
        ok: true,
        message: "Demo mode - agency access assignment simulated",
        membership: { id: 'demo-membership' }
      });
    }

    // Verify the workspace exists and user has access
    const workspace = await db().workspace.findUnique({
      where: { id: workspaceId },
      include: {
        Membership: {
          where: { workspaceId, role: 'OWNER' }
        }
      }
    });

    if (!workspace || workspace.Membership.length === 0) {
      return NextResponse.json({ ok: false, error: 'FORBIDDEN', message: "You don't have permission to manage this workspace" }, { status: 403 });
    }

    // Create or update membership
    const membership = await db().membership.upsert({
      where: { 
        userId_workspaceId: { userId, workspaceId } 
      },
      update: { role: roleEnum },
      create: { userId, workspaceId, role: roleEnum },
    });

    return NextResponse.json({
      ok: true,
      message: "Agency access assigned successfully",
      membership
    });
  } catch (err: any) {
    // Prisma error mapping
    if (err?.code === 'P2002') {
      return NextResponse.json({ ok: false, error: 'CONFLICT' }, { status: 409 });
    }
    if (err?.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'FK_CONSTRAINT' }, { status: 400 });
    }
    console.error('[agency][list][POST] INTERNAL_ERROR', err);
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });

    // Get workspaceId from query params OR auto-detect from user's membership
    const { searchParams } = new URL(req.url);
    let workspaceId = searchParams.get('workspaceId');
    const userId = searchParams.get('userId');
    
    if (!workspaceId && session.user?.id) {
      const membership = await db().membership.findFirst({
        where: { 
          userId: session.user.id,
          role: { in: ['OWNER', 'MANAGER', 'MEMBER'] }
        },
        select: { workspaceId: true },
        orderBy: { createdAt: 'asc' }
      });
      
      if (membership) {
        workspaceId = membership.workspaceId;
      }
    }
    
    if (!workspaceId) {
      return NextResponse.json({ ok: false, error: 'NO_WORKSPACE' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'BAD_REQUEST', message: 'userId is required' }, { status: 400 });
    }

    // For demo mode, return mock response
    if (workspaceId === 'demo-workspace') {
      return NextResponse.json({
        ok: true,
        message: "Demo mode - agency access removal simulated"
      });
    }

    // Verify the workspace exists and user has access
    const workspace = await db().workspace.findUnique({
      where: { id: workspaceId },
      include: {
        Membership: {
          where: { workspaceId, role: 'OWNER' }
        }
      }
    });

    if (!workspace || workspace.Membership.length === 0) {
      return NextResponse.json({ ok: false, error: 'FORBIDDEN', message: "You don't have permission to manage this workspace" }, { status: 403 });
    }

    // Delete membership
    await db().membership.delete({
      where: { 
        userId_workspaceId: { userId, workspaceId } 
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Agency access removed successfully"
    });
  } catch (err: any) {
    // Prisma error mapping
    if (err?.code === 'P2025') {
      return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });
    }
    console.error('[agency][list][DELETE] INTERNAL_ERROR', err);
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

