// src/app/api/media-pack/generate/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { renderPdfFromUrl } from "@/services/mediaPack/renderer";
import { uploadPDF } from "@/lib/storage";

const log = {
  info: (...args: any[]) => console.log("[media-pack]", ...args),
  warn: (...args: any[]) => console.warn("[media-pack]", ...args),
  error: (...args: any[]) => console.error("[media-pack]", ...args),
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

async function POST_impl(req: NextRequest) {
  const started = Date.now();

  try {
    const body = await req.json().catch(() => ({}));
    const packId = body?.packId || body?.id || "demo-pack-123";
    const variant = (body?.variant || "classic").toLowerCase();
    const dark = !!body?.dark;

    console.log("Step: parsed JSON", { packId, variant, dark });

    // Build absolute origin for Netlify
    const proto =
      req.headers.get("x-forwarded-proto") ||
      (process.env.NODE_ENV === "production" ? "https" : "http");
    const host =
      req.headers.get("x-forwarded-host") ||
      req.headers.get("host") ||
      process.env.NEXT_PUBLIC_APP_HOST ||
      "localhost:3000";
    const origin = `${proto}://${host}`;

    const printUrl = `${origin}/media-pack/print?mp=${encodeURIComponent(
      packId
    )}&variant=${encodeURIComponent(variant)}&dark=${dark ? "1" : "0"}`;

    console.log("Step: built printUrl", printUrl);

    // Render from SSR print page
    const pdfBuffer = await renderPdfFromUrl(printUrl);

    console.log("Step: rendered PDF size", pdfBuffer?.length);

    const filename = `media-pack-${packId}-${variant}${dark ? "-dark" : ""}.pdf`;
    const { url: uploadedUrl, key } = await uploadPDF(pdfBuffer, filename);

    console.log("Step: uploaded PDF", { url: uploadedUrl, key });

    // DB persistence disabled for now (no prisma in this build)
    log.info("MediaPack generate: skipping DB update (no prisma in this build)", { packId });

    const ms = Date.now() - started;
    log.info("mediapack.generate.ok", { ms, size: pdfBuffer.length, key });

    // Return proxy URL that is guaranteed to be fetchable
    return NextResponse.json({ ok: true, url: uploadedUrl, key });
  } catch (err: any) {
    console.error("Generate PDF failed:", err);
    log.error("mediapack.generate.fail", {
      err: String(err?.message || err),
      stack: err?.stack,
    });
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to generate media pack PDF" },
      { status: 500 }
    );
  }
}

export const POST = POST_impl;