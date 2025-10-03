import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { renderBufferFromPayload } from "@/services/mediaPack/pdf/build";
import { stableHash, sha256 } from "@/lib/hash";
import { getOrigin } from "@/lib/urls";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const packId = body?.packId;
    const variant = (body?.variant ?? "classic").toLowerCase();
    const force = !!body?.force;

    if (!packId) return NextResponse.json({ ok: false, error: "packId required" }, { status: 400 });

    const pack = await db().mediaPack.findUnique({ 
      where: { id: packId },
      select: { 
        id: true, 
        payload: true, 
        theme: true
      }
    });
    if (!pack) return NextResponse.json({ ok: false, error: "pack not found" }, { status: 404 });

    // Check if we already have a recent file for this pack and variant
    if (!force) {
      const latest = await db().mediaPackFile.findFirst({
        where: { packId: pack.id, variant },
        select: { id: true },
        orderBy: { createdAt: "desc" }
      });
      if (latest) {
        const origin = getOrigin(req);
        return NextResponse.json({ ok: true, cached: true, fileId: latest.id, fileUrl: `${origin}/api/media-pack/file/${latest.id}` });
      }
    }

    const pdf = await renderBufferFromPayload(pack.payload, pack.theme || { brandColor: "#3b82f6" }, variant);
    const digest = sha256(pdf);

    const created = await db().mediaPackFile.create({
      data: {
        packId: pack.id,
        variant,
        mime: "application/pdf",
        size: pdf.length,
        sha256: digest,
        data: pdf
      },
      select: { id: true }
    });

    // PDF generated successfully

    const origin = getOrigin(req);
    return NextResponse.json({
      ok: true,
      cached: false,
      fileId: created.id,
      fileUrl: `${origin}/api/media-pack/file/${created.id}`
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "generate failed" }, { status: 500 });
  }
}