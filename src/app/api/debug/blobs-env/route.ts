import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  let exports = "unknown";
  let hasPut = false;
  let putError = null;

  try {
    const blobs = await import("@netlify/blobs");
    exports = Object.keys(blobs).sort().join(",");
    hasPut = typeof (blobs as any).put === "function";
  } catch (e: any) {
    putError = e.message;
  }

  const diagnostics = {
    ok: hasPut,
    runtime: {
      AWS_LAMBDA_FUNCTION_NAME: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
      LAMBDA_TASK_ROOT: !!process.env.LAMBDA_TASK_ROOT,
      NEXT_RUNTIME: process.env.NEXT_RUNTIME || "unknown",
    },
    blobsSDK: { 
      exports, 
      hasPut,
      error: putError 
    },
    fix: hasPut ? "SDK is correct" : "Need to clear Netlify cache and redeploy with external_node_modules = ['@netlify/blobs']"
  };

  return NextResponse.json(diagnostics, { status: hasPut ? 200 : 500 });
}