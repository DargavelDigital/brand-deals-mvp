// src/lib/storage.ts
// v6-only Netlify Blobs uploader for PDFs.
// Requires @netlify/blobs >= 6 and @netlify/plugin-nextjs enabled in Netlify.

import type { BlobPutResult } from "@netlify/blobs";
import { put } from "@netlify/blobs";

type StorageResult = { url: string; key: string };

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadPDF(buffer: Buffer, filename: string): Promise<StorageResult> {
  const key = `pdfs/${Date.now()}_${sanitize(filename)}`;

  // NOTE: access:'public' returns a public URL served at /.netlify/blobs/<key>
  const result: BlobPutResult = await put(key, buffer, {
    access: "public",
    contentType: "application/pdf",
    // immutable: true, // optional if you want CDN immutable
  });

  // Some older Netlify edges didn't return `url`. Construct if missing.
  const url = result.url ?? `/.netlify/blobs/${key}`;
  return { url, key };
}