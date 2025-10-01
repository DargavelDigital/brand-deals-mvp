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

/**
 * Upload a PDF buffer and return a URL + key.
 * - On Netlify: uses Blobs (persistent, CDN-backed).
 * - Locally: writes to /public/uploads/pdfs (dev convenience).
 */
export async function uploadPDF(buffer: Buffer, filename: string): Promise<{ url: string; key: string }> {
  const sanitized = filename.replace(/[^a-zA-Z0-9.\-_]/g, "_")
  const key = `${Date.now()}_${sanitized}`

  if (isNetlifyRuntime()) {
    // --- Netlify Blobs ---
    const { getStore } = await import("@netlify/blobs")
    const store = getStore("pdfs")
    await store.set(key, buffer, { contentType: "application/pdf" })

    // Return the real Netlify Blobs public URL
    const base = process.env.URL || `https://${process.env.SITE_NAME}.netlify.app`
    const url = `${base}/.netlify/blobs/${key}`
    return { url, key }
  }

  // --- Local/dev fallback (filesystem) ---
  const fs = await import("node:fs/promises")
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "pdfs")
  await fs.mkdir(uploadsDir, { recursive: true })
  const filePath = path.join(uploadsDir, key)
  await fs.writeFile(filePath, buffer)
  const base = (process.env.APP_URL || "http://localhost:3000").replace(/\/+$/, "")
  return { url: `${base}/uploads/pdfs/${key}`, key }
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