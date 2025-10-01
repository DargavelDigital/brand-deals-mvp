// src/app/api/debug/storage-test/route.ts
import { NextResponse } from "next/server";
import { uploadTextTest } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  try {
    const result = await uploadTextTest(`hello ${Date.now()}`, "debug-probe.txt");
    return NextResponse.json({
      ok: true,
      elapsedMs: Date.now() - started,
      result,
      env: {
        AWS_LAMBDA_FUNCTION_NAME: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
        LAMBDA_TASK_ROOT: !!process.env.LAMBDA_TASK_ROOT,
        NEXT_RUNTIME: process.env.NEXT_RUNTIME || null,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        elapsedMs: Date.now() - started,
        result: null,
        error: String(err?.message || err),
        stack: err?.stack,
      },
      { status: 500 }
    );
  }
}