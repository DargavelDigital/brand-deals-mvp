// src/app/api/media-pack/generate/route.ts
// --- 100% surgical diagnostics for generate route ---
// - stream mode: returns the PDF directly (no DB write)
// - diag: emits step tracing so you see exactly where it dies
// - Neon-safe: DB write is inside a guarded block

import { NextRequest, NextResponse } from "next/server";
import { renderPdfFromUrl } from "@/services/mediaPack/renderer";
import { getOrigin } from "@/lib/urls";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

let prismaFn: any;
try {
  const svc = require("@/services/prisma");
  prismaFn = svc.prisma || svc.default || svc;
} catch {
  const { PrismaClient } = require("@prisma/client");
  const _global = globalThis as any;
  _global.__prisma ||= new PrismaClient();
  prismaFn = () => _global.__prisma;
}

async function savePdfToDb(opts: {
  packId: string;
  variant: string;
  dark: boolean;
  pdf: Buffer;
  sha256: string;
}) {
  const { packId, variant, dark, pdf, sha256 } = opts;
  const mime = "application/pdf";
  const size = pdf.length;

  const row = await prismaFn().mediaPackFile.create({
    data: {
      packId,
      variant,
      dark,
      mime,
      size,
      sha256,
      data: pdf,
    },
    select: { id: true },
  });

  return row.id;
}

function sha256(buf: Buffer) {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(buf).digest("hex");
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "Use POST for /api/media-pack/generate" }, { status: 405 });
}

async function POST_impl(req: NextRequest) {
  const started = Date.now();

  try {
    const body = await req.json().catch(() => ({}));
    const packId = body?.packId || body?.id || "demo-pack-123";
    const variant = (body?.variant || "classic").toLowerCase();
    const dark = !!body?.dark;
    const mode = (body?.mode || "save") as "save" | "stream";

    const origin = getOrigin(req);
    // The print page is now in the (public) route group to bypass app shell
    const printUrl = `${origin}/media-pack/print?mp=${encodeURIComponent(
      packId
    )}&variant=${encodeURIComponent(variant)}&dark=${dark ? "1" : "0"}`;

    console.log("PDF Generate: Starting", { packId, variant, dark, mode, printUrl });

    // Render via Puppeteer
    console.log("PDF Generate: Calling renderPdfFromUrl with:", printUrl);
    const pdfBuffer: Buffer = await renderPdfFromUrl(printUrl);
    
    // TEMP DEBUG: Save the HTML that Puppeteer received
    try {
      const fs = require("fs");
      const path = require("path");
      const debugDir = "/tmp";
      if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });
      
      // Try to get the HTML content from Puppeteer (if available)
      console.log("PDF Generate: Debug - PDF buffer size:", pdfBuffer?.length || 0);
      
      // Save a small sample of the PDF to see if it contains "Not found"
      if (pdfBuffer && pdfBuffer.length > 0) {
        const sample = pdfBuffer.slice(0, 1000);
        fs.writeFileSync(path.join(debugDir, "pdf-sample.txt"), sample.toString());
        console.log("PDF Generate: Debug - First 1000 bytes saved to /tmp/pdf-sample.txt");
      }
    } catch (debugErr) {
      console.log("PDF Generate: Debug failed:", debugErr);
    }
    
    if (!pdfBuffer || pdfBuffer.length < 1000) {
      throw new Error("PDF buffer empty or too small");
    }
    const digest = sha256(pdfBuffer);

    console.log("PDF Generate: Rendered", { size: pdfBuffer.length, sha256: digest });

    // 2) If in 'stream' mode, return the file directly (bypasses Neon)
    if (mode === "stream") {
      console.log("PDF Generate: Stream mode");
      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="media-pack-${packId}-${variant}${dark ? "-dark" : ""}.pdf"`,
          "x-mediapack-diag": JSON.stringify({ ok: true, size: pdfBuffer.length }),
        },
      });
    }

    // Save to Neon
    console.log("PDF Generate: Saving to DB");
    const fileId = await savePdfToDb({
      packId,
      variant,
      dark,
      pdf: pdfBuffer,
      sha256: digest,
    });

    // Construct an absolute file URL for the client to open in a new tab
    const fileUrl = `${origin}/api/media-pack/file/${fileId}`;

    const ms = Date.now() - started;
    console.log("PDF Generate: Success", { fileId, fileUrl, ms, size: pdfBuffer.length });
    
    return NextResponse.json({
      ok: true,
      fileId,
      fileUrl,
      ms,
      size: pdfBuffer.length,
      sha256: digest,
    });
  } catch (err: any) {
    console.error("PDF generate error", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to generate media pack PDF" },
      { status: 500 }
    );
  }
}

// Export with idempotency wrapper if you use one; otherwise:
export const POST = POST_impl;