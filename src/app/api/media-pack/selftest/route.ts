import { NextResponse } from "next/server";
import { renderPdfFromUrl } from "@/services/mediaPack/renderer";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET() {
  const printUrl = `${process.env.NEXT_PUBLIC_APP_ORIGIN || "http://localhost:3000"}/media-pack/print?mp=demo-pack-123&variant=classic&dark=0`;
  try {
    const pdf = await renderPdfFromUrl(printUrl);
    return NextResponse.json({ ok: true, size: pdf.length, printUrl });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err), stack: err?.stack, printUrl });
  }
}
