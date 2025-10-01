import { NextRequest, NextResponse } from 'next/server';
import { renderPdfFromUrl } from '@/services/mediaPack/renderer';
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

    console.log("PDF GENERATE DEBUG", { 
      origin, 
      printUrl, 
      packId, 
      variant, 
      dark,
      netlify: !!process.env.NETLIFY,
      vercel: !!process.env.VERCEL
    });
    log.info("MediaPack generate: launching print", { printUrl, packId, variant, dark });

    // Render as PDF from the print page
    const pdfBuffer = await renderPdfFromUrl(printUrl);

    // Build a filename
    const filename = `media-pack-${packId}-${variant}${dark ? "-dark" : ""}.pdf`;

    const isServerless = !!process.env.NETLIFY || !!process.env.VERCEL;

    if (isServerless) {
      // Return inline as base64 so the client can download immediately
      const base64 = Buffer.from(pdfBuffer).toString("base64");
      log.info("MediaPack generate: returning inline PDF (serverless)");
      return new NextResponse(
        JSON.stringify({ ok: true, inline: true, filename, base64 }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      // Local/dev: save to disk and return a URL
      const { uploadPDF } = await import("@/lib/storage");
      const { url: uploadedUrl, key } = await uploadPDF(pdfBuffer, filename);

      try {
        await prisma().mediaPack.update({
          where: { id: packId },
          data: { pdfUrl: uploadedUrl, updatedAt: new Date() },
        });
      } catch (e) {
        log.warn("MediaPack generate: prisma update skipped", { packId, err: String(e) });
      }

      const ms = Date.now() - started;
      log.info("MediaPack generate: done", { ms, size: pdfBuffer.length });
      return NextResponse.json({ ok: true, url: uploadedUrl, key }, { status: 200 });
    }
  } catch (err: any) {
    console.error("PDF GENERATE ERROR", {
      message: err?.message,
      stack: err?.stack,
      printUrl,
    });
    return NextResponse.json(
      { error: "Failed to generate media pack PDF", detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}

export const POST = POST_impl;