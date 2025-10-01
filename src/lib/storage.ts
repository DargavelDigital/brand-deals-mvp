import type { BlobPutResult } from "@netlify/blobs";
let putFn: ((key: string, value: ArrayBuffer | Buffer | Uint8Array, opts?: { contentType?: string }) => Promise<BlobPutResult>) | null = null;

// Lazy import so local dev without @netlify/blobs installed won't crash
async function getNetlifyPut() {
  if (putFn) return putFn;
  try {
    const { put } = await import("@netlify/blobs");
    // some bundlers mangle names; keep a direct ref
    putFn = put;
    return putFn;
  } catch {
    return null;
  }
}

export function detectNetlifyRuntime() {
  const hints: Record<string, any> = {
    NETLIFY: process.env.NETLIFY,
    NETLIFY_GRAPH_TOKEN: !!process.env.NETLIFY_GRAPH_TOKEN,
    AWS_LAMBDA_FUNCTION_NAME: process.env.AWS_LAMBDA_FUNCTION_NAME,
    LAMBDA_TASK_ROOT: process.env.LAMBDA_TASK_ROOT,
    // Next/Netlify adapter sometimes sets this
    NEXT_RUNTIME: process.env.NEXT_RUNTIME,
  };

  // primary truth
  if (process.env.NETLIFY === "true") return { isNetlify: true, reason: "env.NETLIFY=true", hints };

  // secondary hints frequently present on Netlify
  if (process.env.NETLIFY_GRAPH_TOKEN) return { isNetlify: true, reason: "env.NETLIFY_GRAPH_TOKEN present", hints };
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) return { isNetlify: true, reason: "AWS_LAMBDA_FUNCTION_NAME present", hints };
  if (process.env.LAMBDA_TASK_ROOT?.includes("/var/task")) return { isNetlify: true, reason: "LAMBDA_TASK_ROOT=/var/task*", hints };

  // otherwise assume not Netlify (local/dev)
  return { isNetlify: false, reason: "no-netlify-hints", hints };
}

export type StorageResult = { url: string; key: string };

export async function uploadPDF(buffer: Buffer, filename: string): Promise<StorageResult> {
  const detection = detectNetlifyRuntime();

  if (detection.isNetlify) {
    // ✅ Netlify path: use Blobs
    const put = await getNetlifyPut();
    if (!put) {
      // Safety net: if package missing, surface a clear error
      throw new Error("Netlify runtime detected but @netlify/blobs.put is unavailable");
    }
    const key = `pdfs/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const res = await put(key, buffer, { contentType: "application/pdf" });
    // `res.downloadURL` exists on Netlify builds of @netlify/blobs
    const url = (res as any).downloadURL || (res as any).url || "";
    if (!url) throw new Error("Netlify blobs put returned no public URL");
    return { url, key };
  }

  // 🧪 Local/dev fallback: write to /public/uploads/pdfs
  const fs = await import("fs/promises");
  const path = await import("path");
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "pdfs");
  await fs.mkdir(uploadsDir, { recursive: true });

  const finalName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const finalPath = path.join(uploadsDir, finalName);
  await fs.writeFile(finalPath, buffer);

  const base = process.env.NEXT_PUBLIC_APP_HOST
    ? `https://${process.env.NEXT_PUBLIC_APP_HOST}`
    : (process.env.APP_URL || "http://localhost:3000");

  return {
    url: `${base}/uploads/pdfs/${finalName}`,
    key: `pdfs/${finalName}`,
  };
}

export async function deletePDF(key: string): Promise<void> {
  const detection = detectNetlifyRuntime();
  
  if (detection.isNetlify) {
    // Netlify: try to delete from Blobs (if available)
    try {
      const { del } = await import("@netlify/blobs");
      await del(key);
    } catch (error) {
      console.warn('Failed to delete PDF from Netlify Blobs:', error);
    }
  } else {
    // Local dev: delete from filesystem
    const fs = await import('fs/promises');
    const path = await import('path');
    const fileName = key.split("/").slice(-1)[0];
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'pdfs', fileName);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('Failed to delete PDF file:', error);
    }
  }
}