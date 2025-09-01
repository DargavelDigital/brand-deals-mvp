import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { requireSession } from "@/lib/auth/requireSession";

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

  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;

  try {
    const memberships = await prisma.membership.findMany({
      where: { 
        userId: (session.user as any).id,
        role: { in: ['OWNER', 'MANAGER'] }
      },
      include: {
        workspace: true,
        user: true
      },
      orderBy: { createdAt: "desc" },
    });

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
    return json({
      ok: false,
      traceId,
      error: "INTERNAL_ERROR",
      message: process.env.NODE_ENV === "development" ? String(e?.message ?? e) : undefined,
    }, 500);
  }
}

// POST: Assign agency access
export async function POST(req: NextRequest) {
  const traceId = req.headers.get("x-trace-id") ?? crypto.randomUUID();

  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;

  // Only workspace owners can assign agency access
  if ((session.user as any).role !== 'OWNER') {
    return json({ ok: false, traceId, error: "FORBIDDEN" }, 403);
  }

  try {
    const body = await req.json();
    const { userId, workspaceId, role = 'MEMBER' } = body;

    if (!userId || !workspaceId) {
      return json({ 
        ok: false, 
        traceId, 
        error: "INVALID_REQUEST", 
        message: "userId and workspaceId are required" 
      }, 400);
    }

    // Verify the workspace exists and user has access
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        memberships: {
          where: { userId: (session.user as any).id, role: 'OWNER' }
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
      message: process.env.NODE_ENV === "development" ? String(e?.message ?? e) : undefined,
    }, 500);
  }
}

// DELETE: Remove agency access
export async function DELETE(req: NextRequest) {
  const traceId = req.headers.get("x-trace-id") ?? crypto.randomUUID();

  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;

  // Only workspace owners can remove agency access
  if ((session.user as any).role !== 'OWNER') {
    return json({ ok: false, traceId, error: "FORBIDDEN" }, 403);
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const workspaceId = searchParams.get('workspaceId');

    if (!userId || !workspaceId) {
      return json({ 
        ok: false, 
        traceId, 
        error: "INVALID_REQUEST", 
        message: "userId and workspaceId are required" 
      }, 400);
    }

    // Verify the workspace exists and user has access
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        memberships: {
          where: { userId: (session.user as any).id, role: 'OWNER' }
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
      message: process.env.NODE_ENV === "development" ? String(e?.message ?? e) : undefined,
    }, 500);
  }
}
