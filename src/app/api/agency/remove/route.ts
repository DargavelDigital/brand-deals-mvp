import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
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

export async function POST(req: NextRequest) {
  const traceId = req.headers.get("x-trace-id") ?? crypto.randomUUID();

  const gate = await requireSession(req);
  if (!gate.ok) return gate.res;
  const session = gate.session!;

  // Only workspace owners can remove members
  if ((session.user as any).role !== 'OWNER') {
    return json({ ok: false, traceId, error: "FORBIDDEN" }, 403);
  }

  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return json({ 
        ok: false, 
        traceId, 
        error: "INVALID_REQUEST", 
        message: "User ID is required" 
      }, 400);
    }

    // Prevent removing yourself
    if (userId === (session.user as any).id) {
      return json({ 
        ok: false, 
        traceId, 
        error: "INVALID_REQUEST", 
        message: "Cannot remove yourself from the workspace" 
      }, 400);
    }

    // Delete membership
    await prisma.membership.delete({
      where: { 
        userId_workspaceId: { userId, workspaceId: (session.user as any).workspaceId } 
      },
    });

    return json({
      ok: true,
      traceId,
      message: "Member removed successfully"
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
