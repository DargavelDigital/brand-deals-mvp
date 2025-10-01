// src/app/api/media-pack/file/[...key]/route.ts
import { NextResponse } from "next/server";

// Use direct functions (stable in Netlify) when available.
// We keep a dynamic import fallback for local dev.
let netlifyGet: undefined | ((key: string, opts?: any) => Promise<any>);

async function getBlob(key: string) {
  try {
    if (!netlifyGet) {
      const mod = await import("@netlify/blobs");
      // Prefer top-level get (most reliable)
      netlifyGet = (mod as any).get;
      if (typeof netlifyGet !== "function") {
        // Fallback to store API if needed
        const store = (mod as any).blobs?.();
        if (store?.get && typeof store.get === "function") {
          netlifyGet = store.get.bind(store);
        }
      }
    }
  } catch {
    // ignored; maybe not in Netlify or module missing in dev
  }

  if (netlifyGet) {
    // Netlify Blobs
    const blob = await netlifyGet(key, { type: "stream" }).catch(() => null);
    if (!blob) return null;
    return new NextResponse(blob.body, {
      headers: {
        "Content-Type": blob.contentType || "application/pdf",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": `inline; filename="${key.split("/").pop()}"`,
      },
    });
  }

  // Local dev fallback (filesystem)
  const fs = await import("fs/promises");
  const path = await import("path");
  const filePath = path.join(process.cwd(), "public", key);
  try {
    const data = await fs.readFile(filePath);
    return new NextResponse(data, {
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "public, max-age=3600",
        "Content-Disposition": `inline; filename="${key.split("/").pop()}"`,
      },
    });
  } catch {
    return null;
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { key: string[] } }
) {
  const key = params.key.join("/");
  const res = await getBlob(key);
  if (res) return res;
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
