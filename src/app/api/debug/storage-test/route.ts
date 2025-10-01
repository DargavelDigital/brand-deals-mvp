import { NextResponse } from "next/server";
import { uploadPDF } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const buf = Buffer.from("%PDF-1.4\n% test\n");
    const { url, key } = await uploadPDF(buf, "probe.pdf");

    return NextResponse.json({
      ok: true,
      where: process.env.NETLIFY ? "netlify" : "local",
      store: process.env.NETLIFY_BLOBS_STORE || "media-packs",
      url,
      key,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: String(err?.message || err),
        stack: err?.stack,
        env: {
          NETLIFY: !!process.env.NETLIFY,
          NETLIFY_BLOBS_STORE: process.env.NETLIFY_BLOBS_STORE,
        },
      },
      { status: 500 }
    );
  }
}