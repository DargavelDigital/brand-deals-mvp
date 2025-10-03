import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { packId, theme, payload } = body;
    
    if (!packId) {
      return NextResponse.json({ ok: false, error: "Missing packId" }, { status: 400 });
    }

    // Upsert the media pack with theme and payload
    const mp = await prisma().mediaPack.upsert({
      where: { id: packId },
      update: {
        theme: theme || {},
        payload: payload || {},
        updatedAt: new Date()
      },
      create: {
        id: packId,
        variant: theme?.variant || "classic",
        theme: theme || {},
        payload: payload || {},
        workspaceId: "demo-workspace", // TODO: Get from session
        creatorId: "demo-creator", // TODO: Get from session
        demo: true
      }
    });

    return NextResponse.json({ ok: true, packId: mp.id });
  } catch (err: any) {
    console.error("Media pack save error:", err);
    return NextResponse.json({ ok: false, error: "Failed to save media pack" }, { status: 500 });
  }
}
