import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { requireSessionOrDemo } from "@/lib/auth/requireSessionOrDemo";

export const runtime = "nodejs";

type Ok = {
  ok: true;
  traceId: string;
  message?: string;
  data?: any;
};

type Err = {
  ok: false;
  traceId: string;
  error:
    | "UNAUTHENTICATED"
    | "FORBIDDEN"
    | "INVALID_REQUEST"
    | "NOT_FOUND"
    | "INTERNAL_ERROR";
  message?: string;
};

function json(data: Ok | Err, init?: number) {
  return NextResponse.json(data, { status: init ?? 200 });
}

// GET: List agency access
export async function GET(req: NextRequest) {
  const traceId = req.headers.get("x-trace-id") ?? crypto.randomUUID();

  try {
    console.log('GET /api/agency/list - Starting request');
    console.log('DATABASE_URL available:', !!process.env.DATABASE_URL);
    
    const workspaceId = await requireSessionOrDemo(req);
    console.log('GET /api/agency/list - workspaceId:', workspaceId);
    
    if (!workspaceId) {
      return json({
        ok: false,
        traceId,
        error: "UNAUTHENTICATED",
        message: "Authentication required"
      }, 401);
    }

    // For demo mode, return mock data
    if (workspaceId === 'demo-workspace') {
      return json({
        ok: true,
        traceId,
        data: {
          items: [{
            id: 'demo-workspace',
            name: 'Demo Workspace',
            role: 'owner',
            addedAt: new Date().toISOString(),
          }]
        }
      });
    }

    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.log('DATABASE_URL not available, returning empty list');
      return json({
        ok: true,
        traceId,
        data: { items: [] }
      });
    }

    console.log('GET /api/agency/list - Querying database for workspace:', workspaceId);
    
    const memberships = await prisma.membership.findMany({
      where: { 
        workspaceId,
        role: { in: ['OWNER', 'MANAGER'] }
      },
      include: {
        workspace: true,
        user: true
      },
      orderBy: { createdAt: "desc" },
    });

    console.log('GET /api/agency/list - Database query successful, memberships:', memberships.length);

    return json({
      ok: true,
      traceId,
      data: {
        items: memberships.map(m => ({
          id: m.workspaceId,
          name: m.workspace.name,
          role: m.role.toLowerCase(),
          addedAt: m.createdAt.toISOString(),
        }))
      }
    });
  } catch (e: any) {
    console.error('GET /api/agency/list error:', e);
    console.error('Error stack:', e instanceof Error ? e.stack : 'No stack trace');
    return json({
      ok: false,
      traceId,
      error: "INTERNAL_ERROR",
      message: env.NODE_ENV === "development" ? String(e?.message ?? e) : undefined,
    }, 500);
  }
}

// POST: Assign agency access
export async function POST(req: NextRequest) {
  const traceId = req.headers.get("x-trace-id") ?? crypto.randomUUID();

  try {
    const workspaceId = await requireSessionOrDemo(req);
    
    if (!workspaceId) {
      return json({
        ok: false,
        traceId,
        error: "UNAUTHENTICATED",
        message: "Authentication required"
      }, 401);
    }

    // For demo mode, return mock response
    if (workspaceId === 'demo-workspace') {
      return json({
        ok: true,
        traceId,
        message: "Demo mode - agency access assignment simulated",
        data: { membership: { id: 'demo-membership' } }
      });
    }

    const body = await req.json();
    const { userId, role = 'MEMBER' } = body;

    if (!userId) {
      return json({ 
        ok: false, 
        traceId, 
        error: "INVALID_REQUEST", 
        message: "userId is required" 
      }, 400);
    }

    // Verify the workspace exists and user has access
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        memberships: {
          where: { workspaceId, role: 'OWNER' }
        }
      }
    });

    if (!workspace || workspace.memberships.length === 0) {
      return json({ 
        ok: false, 
        traceId, 
        error: "FORBIDDEN", 
        message: "You don't have permission to manage this workspace" 
      }, 403);
    }

    // Create or update membership
    const membership = await prisma.membership.upsert({
      where: { 
        userId_workspaceId: { userId, workspaceId } 
      },
      update: { role },
      create: { userId, workspaceId, role },
    });

    return json({
      ok: true,
      traceId,
      message: "Agency access assigned successfully",
      data: { membership }
    });
  } catch (e: any) {
    return json({
      ok: false,
      traceId,
      error: "INTERNAL_ERROR",
      message: env.NODE_ENV === "development" ? String(e?.message ?? e) : undefined,
    }, 500);
  }
}

// DELETE: Remove agency access
export async function DELETE(req: NextRequest) {
  const traceId = req.headers.get("x-trace-id") ?? crypto.randomUUID();

  try {
    const workspaceId = await requireSessionOrDemo(req);
    
    if (!workspaceId) {
      return json({
        ok: false,
        traceId,
        error: "UNAUTHENTICATED",
        message: "Authentication required"
      }, 401);
    }

    // For demo mode, return mock response
    if (workspaceId === 'demo-workspace') {
      return json({
        ok: true,
        traceId,
        message: "Demo mode - agency access removal simulated"
      });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return json({ 
        ok: false, 
        traceId, 
        error: "INVALID_REQUEST", 
        message: "userId is required" 
      }, 400);
    }

    // Verify the workspace exists and user has access
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        memberships: {
          where: { workspaceId, role: 'OWNER' }
        }
      }
    });

    if (!workspace || workspace.memberships.length === 0) {
      return json({ 
        ok: false, 
        traceId, 
        error: "FORBIDDEN", 
        message: "You don't have permission to manage this workspace" 
      }, 403);
    }

    // Delete membership
    await prisma.membership.delete({
      where: { 
        userId_workspaceId: { userId, workspaceId } 
      },
    });

    return json({
      ok: true,
      traceId,
      message: "Agency access removed successfully"
    });
  } catch (e: any) {
    return json({
      ok: false,
      traceId,
      error: "INTERNAL_ERROR",
      message: env.NODE_ENV === "development" ? String(e?.message ?? e) : undefined,
    }, 500);
  }
}
