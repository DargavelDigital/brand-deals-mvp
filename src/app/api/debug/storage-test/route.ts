import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const key = `pdfs/debug-${Date.now()}.txt`;
  
  try {
    // Dynamic import to test actual bundling
    const { put } = await import("@netlify/blobs");
    
    if (typeof put !== "function") {
      throw new Error("put() function not available - wrong SDK version bundled");
    }

    const res = await put(key, "hello from blobs", {
      access: "public",
      contentType: "text/plain",
    });
    
    const url = res?.url ?? `/.netlify/blobs/${key}`;
    
    return NextResponse.json({ 
      ok: true, 
      key, 
      url,
      message: "Storage test successful - v6 SDK working correctly"
    });
    
  } catch (e: any) {
    return NextResponse.json(
      { 
        ok: false, 
        error: e?.message || String(e),
        fix: "Clear Netlify cache and redeploy with external_node_modules = ['@netlify/blobs']"
      },
      { status: 500 }
    );
  }
}