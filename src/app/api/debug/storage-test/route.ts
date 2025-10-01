import { NextResponse } from "next/server";
import { uploadTextTest } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const started = Date.now();
    let result: any = null;
    let uploadError: any = null;

    try {
      result = await uploadTextTest("hello storage test", "storage-test.txt");
    } catch (e: any) {
      uploadError = {
        message: e?.message || String(e),
        name: e?.name,
        stack: e?.stack,
      };
    }

    const elapsed = Date.now() - started;

    return NextResponse.json({
      ok: !uploadError,
      elapsedMs: elapsed,
      result,
      uploadError,
      env: {
        NETLIFY: process.env.NETLIFY,
        AWS_LAMBDA_FUNCTION_NAME: process.env.AWS_LAMBDA_FUNCTION_NAME,
        LAMBDA_TASK_ROOT: process.env.LAMBDA_TASK_ROOT,
        NEXT_PUBLIC_APP_ORIGIN: process.env.NEXT_PUBLIC_APP_ORIGIN,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        fatal: true,
        error: err?.message || String(err),
        stack: err?.stack,
      },
      { status: 500 }
    );
  }
}