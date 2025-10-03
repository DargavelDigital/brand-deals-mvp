import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { renderPdfFromHtml } from "@/services/mediaPack/renderer";
import { getOrigin } from "@/lib/urls"; // your existing helper
import { loadMediaPackById } from "@/lib/mediaPack/loader";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

function sha256(s: string|Buffer) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

export async function POST(req: NextRequest) {
  const t0 = Date.now();
  try {
    const body = await req.json().catch(() => ({}));
    const packId = body?.packId || "demo-pack-123";
    const variant = (body?.variant || "classic").toLowerCase();
    const dark = !!body?.dark;
    const onePager = !!body?.onePager;
    const brandColor = body?.brandColor || "#3b82f6";
    const force = !!body?.force;

    // Load payload (for cache identity)
    const loaded = await loadMediaPackById(packId, {
      variant: variant as any,
      dark,
      onePager,
      brandColor,
    });
    const payload = loaded?.data || {};
    const payloadHash = sha256(JSON.stringify(payload));
    const cacheKey = sha256(
      JSON.stringify({ packId, variant, dark, onePager, brandColor, payloadHash })
    );

    // Try cache unless force
    if (!force) {
      const prior = await prisma().mediaPackFile.findFirst({
        where: {
          packId,
          variant,
          dark,
          sha256: cacheKey,
          // NOTE: only include fields actually present in your schema
        },
        select: { id: true },
      });
      if (prior?.id) {
        const origin = getOrigin(req);
        return NextResponse.json({
          ok: true,
          cached: true,
          fileId: prior.id,
          fileUrl: `${origin}/api/media-pack/file/${prior.id}`,
          ms: Date.now() - t0,
        });
      }
    }

    // Fetch server-rendered HTML from API (no RSC page)
    const origin = getOrigin(req);
    const htmlUrl = `${origin}/api/media-pack/print-html?mp=${encodeURIComponent(packId)}&variant=${encodeURIComponent(variant)}&dark=${dark ? "1" : "0"}&onePager=${onePager ? "1" : "0"}&brandColor=${encodeURIComponent(brandColor)}`;

    const htmlRes = await fetch(htmlUrl, { method: "GET" });
    if (!htmlRes.ok) {
      const text = await htmlRes.text().catch(() => "");
      return NextResponse.json(
        { ok: false, error: `print-html failed: ${htmlRes.status}`, diag: text.slice(0, 2000) },
        { status: 500 }
      );
    }
    const html = await htmlRes.text();

    // Render to PDF
    const pdfBuffer = await renderPdfFromHtml(html);

    // Store to Neon
    const fileRow = await prisma().mediaPackFile.create({
      data: {
        packId,
        variant,
        dark,
        mime: "application/pdf",
        size: pdfBuffer.length,
        sha256: cacheKey,   // cache identity
        data: pdfBuffer,
      },
      select: { id: true },
    });

    return NextResponse.json({
      ok: true,
      cached: false,
      fileId: fileRow.id,
      fileUrl: `${origin}/api/media-pack/file/${fileRow.id}`,
      ms: Date.now() - t0,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to generate media pack PDF" },
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