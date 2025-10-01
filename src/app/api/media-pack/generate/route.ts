// src/app/api/media-pack/generate/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { renderPdfFromUrl } from "@/services/mediaPack/renderer";
import { uploadPDF } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ok: false, error: "Use POST for /api/media-pack/generate" }, { status: 405 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const packId = body?.packId || "demo-pack-123";
    const variant = body?.variant || "classic";
    const dark = !!body?.dark;

    console.log("MP Generate: body", { packId, variant, dark });

    // Build origin using headers
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
    const origin = `${proto}://${host}`;

    const printUrl = `${origin}/media-pack/print?mp=${packId}&variant=${variant}&dark=${dark ? "1" : "0"}`;
    console.log("MP Generate: printUrl", printUrl);

    // Render PDF
    const pdfBuffer = await renderPdfFromUrl(printUrl);
    console.log("MP Generate: pdfSize", pdfBuffer?.length);

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error("PDF buffer is empty");
    }

    // Upload
    const filename = `${Date.now()}_media-pack-${packId}-${variant}${dark ? "-dark" : ""}.pdf`;
    const { url, key } = await uploadPDF(pdfBuffer, filename);
    console.log("MP Generate: uploaded", { url, key });

    return NextResponse.json({ ok: true, url, key });
  } catch (err: any) {
    console.error("Generate PDF failed:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to generate media pack PDF" },
      { status: 500 }
    );
  }
}