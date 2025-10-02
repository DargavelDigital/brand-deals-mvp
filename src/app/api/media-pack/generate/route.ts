// src/app/api/media-pack/generate/route.ts
// --- 100% surgical diagnostics for generate route ---
// - stream mode: returns the PDF directly (no DB write)
// - diag: emits step tracing so you see exactly where it dies
// - Neon-safe: DB write is inside a guarded block

import { NextRequest, NextResponse } from "next/server";
import { renderPdfFromUrl } from "@/services/mediaPack/renderer"; // existing
import { uploadPDFToDb } from "@/lib/storage-db";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

function originFrom(req: NextRequest) {
  const proto =
    req.headers.get("x-forwarded-proto") ||
    (process.env.NODE_ENV === "production" ? "https" : "http");
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    process.env.NEXT_PUBLIC_APP_HOST ||
    "localhost:3000";
  return `${proto}://${host}`;
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "Use POST for /api/media-pack/generate" }, { status: 405 });
}

export async function POST(req: NextRequest) {
  const started = Date.now();
  const diag: any = { step: "start" };

  try {
    const body = await req.json().catch(() => ({}));
    const packId = body?.packId || body?.id || "demo-pack-123";
    const variant = (body?.variant || "classic").toLowerCase();
    const dark = !!body?.dark;
    const mode = (body?.mode || "save") as "save" | "stream"; // NEW

    const origin = originFrom(req);
    const printUrl = `${origin}/media-pack/print?mp=${encodeURIComponent(
      packId
    )}&variant=${encodeURIComponent(variant)}&dark=${dark ? "1" : "0"}`;
    diag.printUrl = printUrl;

    // 1) Render PDF
    diag.step = "render";
    const pdfBuffer = await renderPdfFromUrl(printUrl);
    if (!pdfBuffer || pdfBuffer.length < 1000) {
      throw new Error("Rendered PDF too small");
    }
    diag.rendered = true;
    diag.size = pdfBuffer.length;
    diag.sha256 = crypto.createHash("sha256").update(pdfBuffer).digest("hex");

    // 2) If in 'stream' mode, return the file directly (bypasses Neon)
    if (mode === "stream") {
      diag.step = "stream-return";
      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="media-pack-${packId}-${variant}${dark ? "-dark" : ""}.pdf"`,
          "x-mediapack-diag": JSON.stringify({ ok: true, size: pdfBuffer.length }),
        },
      });
    }

    // 3) Save to Neon (prisma). Adjust to your actual model/column names.
    diag.step = "db-write";
    
    // Use the existing storage-db helper
    const filename = `${Date.now()}_media-pack-${packId}-${variant}${dark ? "-dark" : ""}.pdf`;
    const { id: fileId, url: fileUrl } = await uploadPDFToDb(pdfBuffer, filename, packId, variant, dark);
    diag.rowId = fileId;

    // 4) Return a reference (ID) that your /media-pack/share/[token] route can resolve
    diag.step = "done";
    const ms = Date.now() - started;
    return NextResponse.json({ ok: true, id: fileId, url: fileUrl, ms, size: pdfBuffer.length });
  } catch (err: any) {
    // Emit the diag steps back to the caller so you can see EXACTLY where it failed
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to generate media pack PDF", diag },
      { status: 500 }
    );
  }
}