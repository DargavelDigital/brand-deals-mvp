import { NextResponse } from "next/server";
import { loadMediaPackById } from "@/lib/mediaPack/loader";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    // Test loading a demo pack
    const pack = await loadMediaPackById("demo");
    
    return NextResponse.json({
      ok: true,
      message: "Media pack loader working",
      hasPayload: !!pack,
      hasTheme: !!pack?.theme,
      hasCreator: !!pack?.creator,
      packId: "demo"
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: "Self-test failed",
      details: error.message
    }, { status: 500 });
  }
}