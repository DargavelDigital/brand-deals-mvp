import { randomUUID } from "crypto";

type StorageResult = { url: string; key: string };

const STORE_NAME = process.env.NETLIFY_BLOBS_STORE || "media-packs";
const IS_NETLIFY = !!process.env.NETLIFY; // true in Netlify builds
const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  (IS_NETLIFY ? "" : "http://localhost:3000");

/**
 * Resolve a Netlify Blobs store in a version-safe way.
 * Returns undefined if the module isn't present or API not available.
 */
async function getNetlifyStore():
  Promise<undefined | { set: (k: string, v: Uint8Array | string, opts?: any) => Promise<void>; getPublicUrl: (k: string) => string; }>
{
  try {
    // Try modern API first
    const mod: any = await import("@netlify/blobs");

    // new (current) way: getStore({ name })
    if (typeof mod.getStore === "function") {
      const store = mod.getStore({ name: STORE_NAME });
      if (store && typeof store.set === "function" && typeof store.getPublicUrl === "function") {
        return store;
      }
    }

    // older variants (rare); keep for safety
    if (mod.blobs && typeof mod.blobs.getStore === "function") {
      const store = mod.blobs.getStore({ name: STORE_NAME });
      if (store && typeof store.set === "function" && typeof store.getPublicUrl === "function") {
        return store;
      }
    }

    // very old experiments: no supported API
    return undefined;
  } catch {
    return undefined;
  }
}

export async function uploadPDF(buffer: Buffer, filename: string): Promise<StorageResult> {
  const key = `pdfs/${Date.now()}-${randomUUID()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

  // 1) Prefer Netlify Blobs (no filesystem writes)
  const store = await getNetlifyStore();
  if (store) {
    await store.set(key, buffer, {
      contentType: "application/pdf",
      // access: "public" is default for public URL exposure via getPublicUrl
      // Some older APIs ignore access—getPublicUrl still returns a signed/public path.
      access: "public",
    });
    const url = store.getPublicUrl(key);
    return { url, key };
  }

  // 2) Fallback for Netlify without Blobs: use /tmp (ephemeral but writable)
  // NOTE: We never try to write under /var/task/public (read-only).
  if (IS_NETLIFY) {
    const fs = await import("fs/promises");
    const path = await import("path");
    const dir = "/tmp/uploads/pdfs";
    await fs.mkdir(dir, { recursive: true });
    const finalPath = path.join(dir, key.split("/").slice(-1)[0]);
    await fs.writeFile(finalPath, buffer);
    // No static serving in functions; return a non-public marker URL so client can show a message
    return { url: `internal://netlify-tmp/${key}`, key };
  }

  // 3) Local dev fallback: write to public/uploads/pdfs so you can click results while testing
  const fs = await import("fs/promises");
  const path = await import("path");
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "pdfs");
  await fs.mkdir(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, key.split("/").slice(-1)[0]);
  await fs.writeFile(filePath, buffer);
  const url = `${BASE_URL}/uploads/pdfs/${key.split("/").slice(-1)[0]}`;
  return { url, key };
}

export async function deletePDF(key: string): Promise<void> {
  const store = await getNetlifyStore();
  if (store && typeof store.delete === "function") {
    try {
      await store.delete(key);
    } catch (error) {
      console.warn('Failed to delete PDF from Netlify Blobs:', error);
    }
  } else if (IS_NETLIFY) {
    // Netlify without Blobs: try to delete from /tmp
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join('/tmp/uploads/pdfs', key.split("/").slice(-1)[0]);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('Failed to delete PDF from /tmp:', error);
    }
  } else {
    // Local dev: delete from filesystem
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'pdfs', key.split("/").slice(-1)[0]);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('Failed to delete PDF file:', error);
    }
  }
}