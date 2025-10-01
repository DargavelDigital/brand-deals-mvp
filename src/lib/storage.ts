// src/lib/storage.ts
// Netlify Blobs-only storage for PDFs.
// - No filesystem writes
// - Works on Netlify Functions (prod/previews) and with `netlify dev` locally
// - Publicly accessible at /.netlify/blobs/<key>

import { blobs } from "@netlify/blobs";

export type StorageResult = {
  url: string; // public URL like "/.netlify/blobs/pdfs/<filename>.pdf"
  key: string; // "pdfs/<filename>.pdf"
};

/**
 * Upload a PDF buffer to Netlify Blobs.
 * Returns a public URL and its key.
 */
export async function uploadPDF(buffer: Buffer, filename: string): Promise<StorageResult> {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error("uploadPDF: buffer must be a Buffer");
  }

  // Keep your existing naming behavior if you prefer. We'll just sanitize.
  const sanitized = String(filename || "media-pack.pdf").replace(/[^a-zA-Z0-9._-]/g, "_");

  // Store under a predictable prefix; you can also add a timestamp if you want uniqueness.
  const key = `pdfs/${sanitized}`;

  const store = blobs();
  // Write file to Blobs (public by default via /.netlify/blobs/<key>)
  await store.set(key, buffer, {
    contentType: "application/pdf",
    // cacheControl: "public, max-age=31536000, immutable", // uncomment if you want long cache
  });

  // Public URL path (Netlify serves this directly)
  const url = `/.netlify/blobs/${key}`;
  return { url, key };
}

/**
 * Tiny sanity helper you can use in diagnostics if needed.
 * Writes a small text blob to ensure Blobs is writable.
 */
export async function uploadTextTest(text: string, name = "test.txt"): Promise<StorageResult> {
  const sanitized = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `pdfs/${sanitized}`;

  const store = blobs();
  await store.set(key, text, {
    contentType: "text/plain; charset=utf-8",
  });

  return { url: `/.netlify/blobs/${key}`, key };
}