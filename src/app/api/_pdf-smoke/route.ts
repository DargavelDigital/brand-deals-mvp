// src/app/api/_pdf-smoke/route.ts
import { NextResponse } from "next/server";
import { renderPdf } from "@/services/mediaPack/renderer";

export async function GET() {
  try {
    const html = `
      <!doctype html>
      <html><head><meta charset="utf-8"><title>PDF Smoke</title></head>
      <body style="font-family: Arial, sans-serif; padding: 24px;">
        <h1>PDF Smoke Test</h1>
        <p>If you can see this as a PDF, Chromium + puppeteer are OK.</p>
      </body></html>
    `;
    const pdf = await renderPdf(html);
    return new NextResponse(pdf, { headers: { "Content-Type": "application/pdf" } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "smoke failed", detail: message }, { status: 500 });
  }
}
