import { NextResponse } from "next/server";
import { loadMediaPackById } from "@/lib/mediaPack/loader";
import { createDemoMediaPackData } from "@/lib/mediaPack/demoData";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Test demo data creation directly
    const demoData = createDemoMediaPackData();
    
    // Test loader with demo ID
    const demoResult = await loadMediaPackById("demo");
    
    // Test loader with non-existent ID
    const fakeResult = await loadMediaPackById("fake-id");
    
    return NextResponse.json({
      demoDataCreated: !!demoData,
      demoDataKeys: demoData ? Object.keys(demoData) : [],
      demoLoaderResult: demoResult,
      fakeLoaderResult: fakeResult,
    });
  } catch (e: any) {
    return NextResponse.json({ 
      error: String(e), 
      stack: e?.stack 
    }, { status: 500 });
  }
}
