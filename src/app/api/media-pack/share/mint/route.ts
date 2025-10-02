import { NextRequest, NextResponse } from "next/server";
import { createShareToken } from "@/lib/storage-db";

// Helper to build absolute origin in Netlify/Next
function getOrigin(req: NextRequest) {
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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { fileId } = await req.json();
    if (!fileId) {
      return NextResponse.json({ ok: false, error: "fileId required" }, { status: 400 });
    }

    // Create share token for the file
    const { token, url: shareUrl } = await createShareToken(fileId);
    
    // Build canonical URL using request origin
    const origin = getOrigin(req);
    const canonicalUrl = `${origin}/media-pack/share/${token}`;

    return NextResponse.json({ 
      ok: true, 
      token, 
      url: canonicalUrl,
      fileId 
    });
  } catch (err: any) {
    console.error("Mint share link error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to mint share link" },
      { status: 500 }
    );
  }
}
