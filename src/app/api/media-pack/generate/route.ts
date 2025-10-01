import { NextRequest, NextResponse } from 'next/server';
import { renderPdfFromUrl } from '@/services/mediaPack/renderer';
import { uploadPDF } from '@/lib/storage';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const maxDuration = 120;

async function POST_impl(req: NextRequest) {
  const started = Date.now();
  try {
    const body = await req.json().catch(() => ({}));
    const packId = body?.packId || body?.id || "demo-pack-123";
    const variant = (body?.variant || "classic").toLowerCase();
    const dark = !!body?.dark;

    // Build absolute origin (Netlify headers included)
    const proto =
      req.headers.get("x-forwarded-proto") ||
      (process.env.NODE_ENV === "production" ? "https" : "http");
    const host =
      req.headers.get("x-forwarded-host") ||
      req.headers.get("host") ||
      process.env.NEXT_PUBLIC_APP_HOST ||
      "localhost:3000";
    const origin = `${proto}://${host}`;

    // New: print page that is public and SSR
    const printUrl = `${origin}/media-pack/print?mp=${encodeURIComponent(
      packId
    )}&variant=${encodeURIComponent(variant)}&dark=${dark ? "1" : "0"}`;

    log.info("MediaPack generate: launching print", { printUrl, packId, variant, dark });

    // Render as PDF from the print page
    const pdfBuffer = await renderPdfFromUrl(printUrl);

    log.info("MediaPack generate: uploading PDF...");

    const filename = `media-pack-${packId}-${variant}${dark ? "-dark" : ""}.pdf`;

    // Avoid name clash with any prior `url` variable
    const { url: uploadedUrl, key } = await uploadPDF(pdfBuffer, filename);

    // Optional: persist a record if you keep temporary media pack rows
    try {
      await prisma().mediaPack.update({
        where: { id: packId },
        data: { pdfUrl: uploadedUrl, updatedAt: new Date() },
      });
    } catch (e) {
      // safe to ignore if demo or record doesn't exist
      log.warn("MediaPack generate: prisma update skipped", { packId, err: String(e) });
    }

    const ms = Date.now() - started;
    log.info("MediaPack generate: done", { ms, size: pdfBuffer.length });

    // Return a simple payload your client already expects
    return NextResponse.json({ ok: true, url: uploadedUrl, key });
  } catch (err: any) {
    log.error("MediaPack generate: failed", { err: String(err?.message || err) });
    return NextResponse.json(
      { error: "Failed to generate media pack PDF" },
      { status: 500 }
    );
  }
}

export const POST = POST_impl;