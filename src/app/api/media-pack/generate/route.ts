/*
 * PDF GENERATION DEBUG CHECKLIST
 * 
 * To debug PDF generation 500 errors:
 * 1. Set MEDIAPACK_DEBUG=true in Netlify environment variables
 * 2. Click "Generate PDF" button
 * 3. Open Netlify Functions logs
 * 4. Look for this sequence:
 *    [mp.generate.start] → [mp.renderer.launch.ok] → [mp.renderer.goto.ok] → [mp.renderer.pdf.ok] → [mp.generate.upload.ok]
 * 5. If it breaks, the last *fail* dlog event names the layer that failed
 * 
 * Common failure points:
 * - mp.renderer.launch.error: Chromium not found or can't launch
 * - mp.renderer.goto.throw: Navigation failed (404, timeout, CSP)
 * - mp.renderer.goto.bad: Print page returned 4xx/5xx (check snippet)
 * - mp.renderer.reqfail: Resource loading failed (fonts, CSS, JS)
 * - mp.renderer.pdf.error: PDF generation failed
 */

import { NextRequest, NextResponse } from 'next/server';
import { renderPdfFromUrl } from '@/services/mediaPack/renderer';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/log';
import { dlog } from '@/lib/dlog';

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

    dlog('mp.generate.start', {
      packId, variant, dark,
      nodeEnv: process.env.NODE_ENV,
      appEnv: process.env.APP_ENV,
      nextPublicHost: process.env.NEXT_PUBLIC_APP_HOST,
      origin, printUrl,
    });
    log.info("MediaPack generate: launching print", { printUrl, packId, variant, dark });

    // Render as PDF from the print page
    const t0 = Date.now();
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await renderPdfFromUrl(printUrl);
      dlog('mp.generate.render.ok', { ms: Date.now() - t0, size: pdfBuffer.length });
    } catch (e: any) {
      dlog('mp.generate.render.fail', {
        ms: Date.now() - t0,
        err: String(e?.message || e),
        stack: e?.stack?.slice?.(0, 500),
      });
      throw e; // rethrow to hit the outer 500 handler
    }

    // Build a filename
    const filename = `media-pack-${packId}-${variant}${dark ? "-dark" : ""}.pdf`;

    const isServerless = !!process.env.NETLIFY || !!process.env.VERCEL;

    if (isServerless) {
      // Return inline as base64 so the client can download immediately
      const base64 = Buffer.from(pdfBuffer).toString("base64");
      dlog('mp.generate.inline.ok', { filename, size: pdfBuffer.length });
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
      dlog('mp.generate.upload.start', { filename });
      const { uploadPDF } = await import("@/lib/storage");
      const { url: uploadedUrl, key } = await uploadPDF(pdfBuffer, filename);
      dlog('mp.generate.upload.ok', { key, url: uploadedUrl?.slice?.(0, 120) });

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
    dlog('mp.generate.catch', { err: String(err?.message || err) });
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