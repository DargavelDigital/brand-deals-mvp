// src/lib/storage.ts
// Netlify Blobs via modern SDK (put). Single, stable path.

import type { NextRequest } from "next/server";

export type StorageResult = {
  url: string; // absolute or /.netlify/blobs/<key>
  key: string; // e.g. "pdfs/123_media-pack.pdf"
};

function sanitize(name: string) {
  return String(name || "media-pack.pdf").replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function putBlob(key: string, data: Buffer | Uint8Array, contentType: string) {
  // Import inside function so Netlify bundles it into the function chunk.
  const mod: any = await import("@netlify/blobs");
  const put: any = (mod as any).put;

  if (typeof put !== "function") {
    throw new Error(
      "Netlify Blobs SDK put() missing. Ensure '@netlify/blobs' is installed and '@netlify/plugin-nextjs' is enabled."
    );
  }

  const res = await put(key, data, {
    contentType,
    // optional but nice to have:
    cacheControl: "public, max-age=31536000, immutable",
  });

  // Some runtimes return { url }, others not. Always provide a deterministic fallback.
  return (res && res.url) ? res.url : `/.netlify/blobs/${key}`;
}

export async function uploadPDF(buffer: Buffer, filename: string): Promise<StorageResult> {
  if (!buffer || !Buffer.isBuffer(buffer)) throw new Error("uploadPDF: buffer must be a Buffer");
  const safe = sanitize(filename);
  const key = `pdfs/${safe}`;
  const url = await putBlob(key, buffer, "application/pdf");
  return { url, key };
}

// Tiny text helper for debugging
export async function uploadTextTest(text: string, name = "debug-probe.txt"): Promise<StorageResult> {
  const key = `pdfs/${sanitize(name)}`;
  const url = await putBlob(key, Buffer.from(text, "utf-8"), "text/plain; charset=utf-8");
  return { url, key };
}