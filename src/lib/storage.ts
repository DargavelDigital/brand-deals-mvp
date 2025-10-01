// src/lib/storage.ts
type StorageResult = { url: string; key: string };

function isNetlifyRuntime() {
  // Netlify sets AWS_LAMBDA_FUNCTION_NAME/LAMBDA_TASK_ROOT; NETLIFY env is not always present
  return !!process.env.AWS_LAMBDA_FUNCTION_NAME || !!process.env.LAMBDA_TASK_ROOT;
}

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadPDF(buffer: Buffer, filename: string): Promise<StorageResult> {
  const safe = sanitize(filename);
  const key = `pdfs/${Date.now()}_${safe}`;

  if (isNetlifyRuntime()) {
    // Prefer top-level put; fallback to store if needed
    try {
      const mod = await import("@netlify/blobs");
      const put = (mod as any).put as (k: string, b: any, o?: any) => Promise<any>;
      if (typeof put === "function") {
        await put(key, buffer, {
          contentType: "application/pdf",
          cacheControl: "public, max-age=31536000, immutable",
        });
        return { url: `/api/media-pack/file/${key}`, key };
      }

      // Fallback path (older SDKs)
      const store = (mod as any).blobs?.();
      if (store?.put && typeof store.put === "function") {
        await store.put(key, buffer, {
          contentType: "application/pdf",
          cacheControl: "public, max-age=31536000, immutable",
        });
        return { url: `/api/media-pack/file/${key}`, key };
      }

      throw new Error("Netlify Blobs SDK did not expose put()");
    } catch (err) {
      // As a last resort, fail loudly so UI shows a clear error
      throw new Error(
        `Netlify runtime detected but Blobs upload failed: ${String((err as any)?.message || err)}`
      );
    }
  }

  // Local dev fallback: write to /public
  const fs = await import("fs/promises");
  const path = await import("path");
  const outDir = path.join(process.cwd(), "public", "pdfs");
  await fs.mkdir(outDir, { recursive: true });
  const filePath = path.join(outDir, key.split("/").pop() as string);
  await fs.writeFile(filePath, buffer);
  // Still return via proxy for one consistent path
  return { url: `/api/media-pack/file/${key}`, key };
}