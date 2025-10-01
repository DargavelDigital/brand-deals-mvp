import { NextResponse } from "next/server";
import { renderPdfFromUrl } from "@/services/mediaPack/renderer";
import { headers } from "next/headers";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET() {
  const req = { headers: headers() };
  
  const proto =
    req.headers.get("x-forwarded-proto") ||
    (process.env.NODE_ENV === "production" ? "https" : "http");

  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    process.env.NEXT_PUBLIC_APP_HOST ||
    process.env.APP_URL ||
    (process.env.NODE_ENV === "production"
      ? "hyperprod.netlify.app"
      : "localhost:3000");

  const origin = `${proto}://${host}`;
  const printUrl = `${origin}/media-pack/print?mp=demo-pack-123&variant=classic&dark=0`;

  console.info("MediaPack selftest: resolved origin + print URL", {
    proto,
    host,
    origin,
    printUrl,
  });

  try {
    const pdf = await renderPdfFromUrl(printUrl);
    return NextResponse.json({ ok: true, size: pdf.length, printUrl });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err), stack: err?.stack, printUrl });
  }
}
