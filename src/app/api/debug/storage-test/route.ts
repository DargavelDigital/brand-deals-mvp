import { NextResponse } from "next/server";
import { detectNetlifyRuntime, uploadPDF } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const detection = detectNetlifyRuntime();

    // tiny 1-page PDF buffer (fake) just to test storage path
    const sample = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF");

    const started = Date.now();
    let result: any = null;
    let uploadError: any = null;

    try {
      result = await uploadPDF(sample, "probe.pdf");
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
      detection,
      elapsedMs: elapsed,
      result,
      uploadError,
      env: {
        NETLIFY: process.env.NETLIFY,
        NETLIFY_GRAPH_TOKEN: !!process.env.NETLIFY_GRAPH_TOKEN,
        AWS_LAMBDA_FUNCTION_NAME: process.env.AWS_LAMBDA_FUNCTION_NAME,
        LAMBDA_TASK_ROOT: process.env.LAMBDA_TASK_ROOT,
        NEXT_RUNTIME: process.env.NEXT_RUNTIME,
        NEXT_PUBLIC_APP_HOST: process.env.NEXT_PUBLIC_APP_HOST,
      },
      notes: [
        "If ok=true and result.url is a Netlify _blob_store URL, Blobs is working.",
        "If ok=false with ENOENT on /var/task/public, detection missed; check env above.",
      ],
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