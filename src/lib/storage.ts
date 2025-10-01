import type { Buffer } from "node:buffer"
import path from "node:path"

function isNetlifyRuntime() {
  // Any of these indicate we're inside Netlify's Lambda runtime
  return !!process.env.AWS_LAMBDA_FUNCTION_NAME || !!process.env.LAMBDA_TASK_ROOT || !!process.env.NETLIFY
}

/**
 * Upload a PDF buffer and return a URL + key.
 * - On Netlify: uses Blobs (persistent, CDN-backed).
 * - Locally: writes to /public/uploads/pdfs for convenience.
 */
export async function uploadPDF(buffer: Buffer, filename: string): Promise<{ url: string; key: string }> {
  const sanitized = filename.replace(/[^a-zA-Z0-9.\-_]/g, "_")
  const ts = Date.now()
  const key = `${ts}_${sanitized}`

  if (isNetlifyRuntime()) {
    // --- Netlify Blobs path ---
    // IMPORTANT: @netlify/blobs exports getStore()
    const { getStore } = await import("@netlify/blobs")
    const store = getStore("pdfs") // bucket-like logical store
    // store.set(key, data, { contentType }) persists the file
    await store.set(key, buffer, { contentType: "application/pdf" })

    // We return a proxied URL you control. It reads from Blobs and streams the PDF.
    const base =
      process.env.PUBLIC_APP_ORIGIN ||
      process.env.NEXT_PUBLIC_APP_HOST?.startsWith("http")
        ? process.env.NEXT_PUBLIC_APP_HOST!
        : `https://${process.env.NEXT_PUBLIC_APP_HOST || ""}`.replace(/\/+$/, "")
    const origin =
      base && base.startsWith("http")
        ? base
        : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
          (process.env.URL ? process.env.URL : "") ||
          "" // Netlify sets URL during build, not functions; proxy URL will still work with relative path

    const url = `${origin}/api/media-pack/file/${encodeURIComponent(key)}`
    return { url, key }
  }

  // --- Local/dev fallback (filesystem) ---
  const fs = await import("node:fs/promises")
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "pdfs")
  await fs.mkdir(uploadsDir, { recursive: true })
  const filePath = path.join(uploadsDir, key)
  await fs.writeFile(filePath, buffer)
  const base = process.env.APP_URL || "http://localhost:3000"
  return { url: `${base.replace(/\/+$/, "")}/uploads/pdfs/${key}`, key }
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