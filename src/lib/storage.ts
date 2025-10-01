// src/lib/storage.ts
// Netlify Blobs – runtime-adaptive helper (supports both `put()` and `blobs().set()` shapes)

export type StorageResult = {
  url: string; // public URL (/.netlify/blobs/<key> or absolute)
  key: string; // e.g. "pdfs/123_media-pack.pdf"
};

function sanitize(name: string) {
  return String(name || "media-pack.pdf").replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function putViaTopLevel(key: string, buffer: Buffer): Promise<string> {
  // Newer SDK shape: import { put } from '@netlify/blobs'
  const mod = await import("@netlify/blobs");
  const putFn: any = (mod as any).put;
  if (typeof putFn !== "function") {
    throw new Error("Top-level put() not available");
  }
  const res = await putFn(key, buffer, { contentType: "application/pdf" });
  // res.url may be absolute; always return that if present
  return (res as any).url || `/.netlify/blobs/${key}`;
}

async function putViaStore(key: string, buffer: Buffer): Promise<string> {
  // Older SDK shape: import { blobs } from '@netlify/blobs' -> blobs().set()
  const mod = await import("@netlify/blobs");
  const makeStore: any = (mod as any).blobs;
  if (typeof makeStore !== "function") {
    throw new Error("blobs() store API not available");
  }
  const store = makeStore();
  if (!store || typeof store.set !== "function") {
    throw new Error("store.set() not available on blobs() store");
  }
  await store.set(key, buffer, { contentType: "application/pdf" });
  return `/.netlify/blobs/${key}`;
}

export async function uploadPDF(buffer: Buffer, filename: string): Promise<StorageResult> {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error("uploadPDF: buffer must be a Buffer");
  }

  const key = `pdfs/${sanitize(filename)}`;

  // Try modern `put()` first; fall back to `blobs().set()`
  let url: string;
  try {
    url = await putViaTopLevel(key, buffer);
  } catch (_e1) {
    try {
      url = await putViaStore(key, buffer);
    } catch (e2) {
      const e1 = _e1 as Error;
      const msg = `Netlify Blobs unavailable: put() -> ${e1.message}; blobs().set() -> ${(e2 as Error).message}`;
      throw new Error(msg);
    }
  }

  return { url, key };
}

// Optional: tiny text test used by /api/debug/storage-test
export async function uploadTextTest(text: string, name = "test.txt"): Promise<StorageResult> {
  const key = `pdfs/${sanitize(name)}`;
  const data = Buffer.from(text, "utf-8");
  let url: string;
  try {
    url = await putViaTopLevel(key, data);
  } catch {
    url = await putViaStore(key, data);
  }
  return { url, key };
}