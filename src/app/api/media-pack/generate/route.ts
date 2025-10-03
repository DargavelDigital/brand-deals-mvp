import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { renderPdfFromUrl } from "@/services/mediaPack/renderer";
import { getOrigin } from "@/lib/urls";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 120;

function sha256(buf: Buffer) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const packId = body?.packId;
    if (!packId) {
      return NextResponse.json({ ok: false, error: "Missing packId" }, { status: 400 });
    }

    // Load the saved pack to guarantee preview == print
    const mp = await prisma().mediaPack.findUnique({ where: { id: packId } });
    if (!mp) return NextResponse.json({ ok: false, error: "MediaPack not found" }, { status: 404 });

    const theme = (mp.theme as any) || {};
    const origin = getOrigin(req);
    const printUrl = `${origin}/media-pack/print?mp=${encodeURIComponent(packId)}&variant=${encodeURIComponent(theme.variant||"classic")}&dark=${theme.dark ? "1":"0"}&onePager=${theme.onePager ? "1":"0"}&brandColor=${encodeURIComponent(theme.brandColor || "#3b82f6")}`;

    const pdf = await renderPdfFromUrl(printUrl);
    const digest = sha256(pdf);

    const saved = await prisma().mediaPackFile.create({
      data: {
        packId,
        variant: theme.variant || "classic",
        dark: !!theme.dark,
        mime: "application/pdf",
        size: pdf.length,
        sha256: digest,
        data: pdf,
      },
      select: { id: true },
    });

    const fileUrl = `${origin}/api/media-pack/file/${saved.id}`;
    return NextResponse.json({ ok: true, fileId: saved.id, fileUrl });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: "Failed to generate media pack PDF" }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ ok: false, error: "Use POST for /api/media-pack/generate" }, { status: 405 });
}