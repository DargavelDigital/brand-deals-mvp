import { NextResponse } from "next/server";
import * as blobs from "@netlify/blobs";

export const dynamic = "force-dynamic";

export async function GET() {
  const exports = Object.keys(blobs).sort().join(",");
  const hasPut = typeof (blobs as any).put === "function";
  return NextResponse.json({
    ok: true,
    runtime: {
      AWS_LAMBDA_FUNCTION_NAME: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
      LAMBDA_TASK_ROOT: !!process.env.LAMBDA_TASK_ROOT,
      NEXT_RUNTIME: process.env.NEXT_RUNTIME || "unknown",
    },
    blobsSDK: { exports, hasPut },
  });
}