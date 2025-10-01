import { NextResponse } from "next/server";
import { put } from "@netlify/blobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const key = `pdfs/test-${Date.now()}.txt`;
    const { url } = await put(key, "hello", { 
      contentType: "text/plain", 
      addRandomSuffix: false 
    });
    return NextResponse.json({ ok: true, key, url });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
