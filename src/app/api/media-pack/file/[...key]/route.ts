import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  ctx: { params: { key: string[] } }
) {
  try {
    const raw = (ctx.params?.key || []).join("/");
    if (!raw) {
      return NextResponse.json({ ok: false, error: "Missing key" }, { status: 400 });
    }

    // If running on Netlify → read from blobs
    if (process.env.NETLIFY) {
      const { get } = await import("@netlify/blobs");
      const blob = await get(raw, { type: "bytes" });
      if (!blob) {
        return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
      }
      return new NextResponse(blob, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Cache-Control": "public, max-age=31536000, immutable",
          "Content-Disposition": `inline; filename="${raw.split("/").pop() || "file.pdf"}"`,
        },
      });
    }

    // Local dev: serve from /public/uploads/pdfs
    const path = await import("path");
    const fs = await import("fs/promises");
    const fileName = raw.split("/").pop()!;
    const filePath = path.join(process.cwd(), "public", "uploads", "pdfs", fileName);
    const bytes = await fs.readFile(filePath);
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "no-cache",
        "Content-Disposition": `inline; filename="${fileName}"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, where: "file-route", error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
