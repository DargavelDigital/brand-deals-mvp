import { NextRequest } from "next/server";

type StorageResult = { url: string; key: string };

// Force rebuild - Netlify Blobs implementation v2

// Detect Netlify function runtime with hardened detection
function isRunningOnNetlify() {
  return (
    process.env.NETLIFY === "true" ||               // Netlify build/runtime
    !!process.env.AWS_LAMBDA_FUNCTION_NAME ||       // Any Lambda env
    !!process.env.NETLIFY_GRAPH_TOKEN               // Netlify-specific
  );
}

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
  const isNetlify = isRunningOnNetlify();
  
  console.log("uploadPDF: environment", {
    NETLIFY: process.env.NETLIFY,
    AWS_LAMBDA_FUNCTION_NAME: process.env.AWS_LAMBDA_FUNCTION_NAME,
    NETLIFY_GRAPH_TOKEN: !!process.env.NETLIFY_GRAPH_TOKEN,
    isNetlify: isNetlify,
  });
  
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `pdfs/${timestamp}_${sanitizedFilename}`;

  if (isNetlify) {
    console.log("uploadPDF: Using Netlify Blobs storage");
    // Use Netlify Blobs with direct put function
    const { put } = await import("@netlify/blobs");
    console.log("uploadPDF: put function type =", typeof put);
    
    // Store the file (contentType lets browsers preview/download correctly)
    await put(key, buffer, { contentType: "application/pdf" });

    // We serve via our own route for stable, nice URLs
    const url = `${getBaseUrl()}/api/media-pack/file/${encodeURIComponent(key)}`;
    console.log("uploadPDF: Blob stored successfully, URL =", url);
    return { url, key };
  }

  // Local dev: write to /public/uploads/pdfs
  console.log("uploadPDF: Using local filesystem storage");
  const fs = await import("fs/promises");
  const path = await import("path");
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "pdfs");
  console.log("uploadPDF: Creating directory:", uploadsDir);
  await fs.mkdir(uploadsDir, { recursive: true });

  const filePath = path.join(uploadsDir, key.split("/").pop() || sanitizedFilename);
  console.log("uploadPDF: Writing file to:", filePath);
  await fs.writeFile(filePath, buffer);

  const url = `${getBaseUrl()}/uploads/pdfs/${key.split("/").pop()}`;
  console.log("uploadPDF: File written successfully, URL =", url);
  return { url, key };
}

export async function deletePDF(key: string): Promise<void> {
  if (isRunningOnNetlify()) {
    // Use Netlify Blobs
    const { del } = await import("@netlify/blobs");
    
    try {
      await del(key);
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