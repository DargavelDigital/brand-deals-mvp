import { NextResponse } from "next/server";
import { put } from "@netlify/blobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const key = `debug-${Date.now()}.txt`;
    await put(key, "hello world", { contentType: "text/plain" });

    return NextResponse.json({
      ok: true,
      key,
      url: `/.netlify/blobs/${key}`,
      putType: typeof put,
      NETLIFY: process.env.NETLIFY,
      AWS_LAMBDA_FUNCTION_NAME: process.env.AWS_LAMBDA_FUNCTION_NAME,
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err.message,
      stack: err.stack,
    });
  }
}
