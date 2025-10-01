import { NextResponse } from "next/server";
import { put } from "@netlify/blobs";

export const dynamic = "force-dynamic";

export async function GET() {
  const key = `pdfs/debug-${Date.now()}.txt`;
  try {
    const res = await put(key, "hello from blobs", {
      access: "public",
      contentType: "text/plain",
    });
    const url = res.url ?? `/.netlify/blobs/${key}`;
    return NextResponse.json({ ok: true, key, url });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || String(e) },
      { status: 500 }
    );
  }
}