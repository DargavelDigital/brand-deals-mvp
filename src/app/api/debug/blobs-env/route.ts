// src/app/api/debug/blobs-env/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  let sdkShape = "unknown";
  let hasPut = false;
  try {
    const mod: any = await import("@netlify/blobs");
    sdkShape = Object.keys(mod).join(",");
    hasPut = typeof mod.put === "function";
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    runtime: {
      AWS_LAMBDA_FUNCTION_NAME: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
      LAMBDA_TASK_ROOT: !!process.env.LAMBDA_TASK_ROOT,
      NEXT_RUNTIME: process.env.NEXT_RUNTIME || null,
    },
    blobsSDK: {
      exports: sdkShape,
      hasPut,
    },
  });
}
