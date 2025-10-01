import { NextRequest } from "next/server";

type StorageResult = { url: string; key: string };

// Force rebuild - Netlify Blobs implementation v2

// Detect Netlify function runtime
const IS_NETLIFY = !!process.env.NETLIFY;

// Fallback base URL helper
function getBaseUrl() {
  return (
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_HOST ||
    (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
    "http://localhost:3000"
  );
}

/**
 * Upload a PDF buffer and return a public URL + key.
 * - On Netlify: store in Netlify Blobs
 * - Local dev: write to /public/uploads/pdfs
 */
export async function uploadPDF(buffer: Buffer, filename: string): Promise<StorageResult> {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `pdfs/${timestamp}_${sanitizedFilename}`;

  if (IS_NETLIFY) {
    // Use Netlify Blobs
    const { blobs } = await import("@netlify/blobs");
    const store = blobs();

    // Store the file (contentType lets browsers preview/download correctly)
    await store.set(key, buffer, {
      contentType: "application/pdf",
      cacheControl: "public, max-age=31536000, immutable",
    });

    // We serve via our own route for stable, nice URLs
    const url = `${getBaseUrl()}/api/media-pack/file/${encodeURIComponent(key)}`;
    return { url, key };
  }

  // Local dev: write to /public/uploads/pdfs
  const fs = await import("fs/promises");
  const path = await import("path");
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "pdfs");
  await fs.mkdir(uploadsDir, { recursive: true });

  const filePath = path.join(uploadsDir, key.split("/").pop() || sanitizedFilename);
  await fs.writeFile(filePath, buffer);

  const url = `${getBaseUrl()}/uploads/pdfs/${key.split("/").pop()}`;
  return { url, key };
}

export async function deletePDF(key: string): Promise<void> {
  if (IS_NETLIFY) {
    // Use Netlify Blobs
    const { blobs } = await import("@netlify/blobs");
    const store = blobs();
    
    try {
      await store.delete(key);
    } catch (error) {
      console.warn('Failed to delete PDF from Netlify Blobs:', error);
    }
  } else {
    // Local dev: delete from filesystem
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const filePath = path.join(process.cwd(), 'public', 'uploads', key);
    
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('Failed to delete PDF file:', error);
    }
  }
}