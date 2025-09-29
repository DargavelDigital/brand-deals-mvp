import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { prisma } from '@/lib/prisma';
import { requireSession } from "@/lib/auth/requireSession";
import { env } from "@/lib/env";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

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

  try {
    const session = await requireSession(req);
    if (session instanceof NextResponse) return session;

    // Only workspace owners can invite members
    if ((session.user as any).role !== 'OWNER') {
      return json({ ok: false, traceId, error: "FORBIDDEN" }, 403);
    }

    const body = await req.json();
    const { email, role = 'MEMBER' } = body;

    if (!email) {
      return json({ 
        ok: false, 
        traceId, 
        error: "INVALID_REQUEST", 
        message: "Email is required" 
      }, 400);
    }

    // Find or create the user
    let user = await prisma().user.findUnique({
      where: { email }
    });

    if (!user) {
      user = await prisma().user.create({
        data: { 
          email,
          name: email.split('@')[0] // Use email prefix as name
        }
      });
    }

    // Create or update membership
    const membership = await prisma().membership.upsert({
      where: { 
        userId_workspaceId: { userId: user.id, workspaceId: (session.user as any).workspaceId } 
      },
      update: { role },
      create: { 
        userId: user.id, 
        workspaceId: (session.user as any).workspaceId, 
        role,
        invitedById: (session.user as any).id
      },
    });

    return json({
      ok: true,
      traceId,
      message: "Invitation sent successfully",
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
