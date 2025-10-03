import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrigin } from "@/lib/urls";
import crypto from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

function sha256(buf: Buffer) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const packId = body?.packId ?? "demo-pack-123";
    const variant = (body?.variant ?? "classic").toLowerCase();
    const dark = !!body?.dark;
    const onePager = !!body?.onePager;
    const brandColor = body?.brandColor ?? "#3b82f6";
    const force = !!body?.force;

    // (1) cache check
    if (!force) {
      const existing = await prisma().mediaPackFile.findFirst({
        where: { packId, variant, dark },
        select: { id: true },
        orderBy: { createdAt: "desc" },
      });
      if (existing) {
        const origin = getOrigin(req);
        return NextResponse.json({
          ok: true,
          cached: true,
          fileId: existing.id,
          fileUrl: `${origin}/api/media-pack/file/${existing.id}`,
          ms: 0,
        });
      }
    }

    // TODO: Implement React-PDF based generation
    return NextResponse.json(
      { ok: false, error: "PDF generation temporarily disabled during cleanup" },
      { status: 501 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to generate media pack PDF" },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json(
    { ok: false, error: "Use POST for /api/media-pack/generate" },
    { status: 405 }
  );
}