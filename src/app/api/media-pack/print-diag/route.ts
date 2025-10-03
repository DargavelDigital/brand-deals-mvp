import { NextResponse } from "next/server";
import { loadMediaPackById } from "@/lib/mediaPack/loader"; // your safe loader

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const packId = url.searchParams.get("mp") || "demo-pack-123";
    const variant = (url.searchParams.get("variant") || "classic").toLowerCase();
    const dark = url.searchParams.get("dark") === "1" || url.searchParams.get("dark") === "true";
    const onePager = url.searchParams.get("onePager") === "1" || url.searchParams.get("onePager") === "true";
    const brandColor = url.searchParams.get("brandColor") || "#3b82f6";

    const { ok, data, source, error } = await loadMediaPackById(packId);

    return NextResponse.json({
      ok,
      error: error ? String(error) : null,
      source,
      theme: { variant, dark, onePager, brandColor },
      hasData: !!data,
      keys: data ? Object.keys(data) : [],
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
