import type { Buffer } from "node:buffer"
import path from "node:path"

/** Minimal runtime check – no external helpers */
function isNetlifyRuntime(): boolean {
  return Boolean(
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT ||
    process.env.NETLIFY
  )
}

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * Upload a PDF buffer and return a URL + key.
 * - On Netlify: uses Blobs (persistent, CDN-backed).
 * - Locally: writes to /public/uploads/pdfs (dev convenience).
 */
export async function uploadPDF(buffer: Buffer, filename: string): Promise<{ url: string; key: string }> {
  const safe = sanitize(filename);
  // keep a namespace to organize files (not used in the public URL format, but useful logically)
  const key = `pdfs/${Date.now()}_${safe}`;

  if (isNetlifyRuntime()) {
    // --- Netlify Blobs ---
    const { put } = await import("@netlify/blobs");
    
    // ✅ Let Netlify create the correct, publicly accessible URL
    const { url } = await put(key, buffer, {
      contentType: "application/pdf",
      // If you want cache headers: cacheControl: "public, max-age=31536000, immutable",
      addRandomSuffix: false, // keep the key deterministic for easier listing if you need
    });

    // Return EXACTLY what put() gave us
    return { url, key };
  }

  // --- Local/dev fallback (filesystem) ---
  const fs = await import("node:fs/promises")
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "pdfs")
  await fs.mkdir(uploadsDir, { recursive: true })
  const fileName = key.replace("pdfs/", "") // Remove pdfs/ prefix for local file
  const filePath = path.join(uploadsDir, fileName)
  await fs.writeFile(filePath, buffer)
  const base = (process.env.APP_URL || "http://localhost:3000").replace(/\/+$/, "")
  return { url: `${base}/uploads/pdfs/${fileName}`, key }
}

export async function deletePDF(key: string): Promise<void> {
  if (isNetlifyRuntime()) {
    // Netlify: try to delete from Blobs
    try {
      const { getStore } = await import("@netlify/blobs")
      const store = getStore("pdfs")
      await store.delete(key)
    } catch (error) {
      console.warn('Failed to delete PDF from Netlify Blobs:', error)
    }
  } else {
    // Local dev: delete from filesystem
    const fs = await import('node:fs/promises')
    const fileName = key.split("/").slice(-1)[0]
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'pdfs', fileName)
    try {
      await fs.unlink(filePath)
    } catch (error) {
      console.warn('Failed to delete PDF file:', error)
    }
  }
}