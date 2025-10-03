import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { renderBufferFromPayload } from "@/services/mediaPack/pdf/build";
import { generatePdf } from "@/services/mediaPack/pdf";
import { generateMediaPackHTML } from "@/services/mediaPack/pdf/puppeteer-generator";
import { stableHash, sha256 } from "@/lib/hash";
import { getOrigin } from "@/lib/urls";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const packId = body?.packId;
    const variant = (body?.variant ?? "classic").toLowerCase();
    const force = !!body?.force;

    if (!packId) return NextResponse.json({ ok: false, error: "packId required" }, { status: 400 });

    const pack = await db().mediaPack.findUnique({ 
      where: { packId: packId },
      select: { 
        id: true, 
        payload: true, 
        theme: true,
        contentHash: true
      }
    });
    if (!pack) return NextResponse.json({ ok: false, error: "pack not found" }, { status: 404 });

    const contentHash = stableHash({ payload: pack.payload, theme: pack.theme, variant });

    if (!force && pack.contentHash === contentHash) {
      // already generated? check latest file
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

    // Generate HTML content first
    const htmlContent = await generateMediaPackHTML(pack.payload, pack.theme || { brandColor: "#3b82f6" }, variant);
    
    // Use the adapter to generate PDF based on runtime
    const pdf = await generatePdf(htmlContent);
    const digest = sha256(pdf);

    const created = await db().mediaPackFile.create({
      data: {
        id: `mpf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        packId: pack.id,
        variant,
        mime: "application/pdf",
        size: pdf.length,
        sha256: digest,
        data: pdf
      },
      select: { id: true }
    });

    // store latest contentHash so future calls can be 'cached:true'
    if (pack.contentHash !== contentHash) {
      await db().mediaPack.update({ where: { packId: packId }, data: { contentHash } });
    }

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