import { env } from './env'

export interface StorageResult {
  url: string
  key: string
}

export async function uploadPDF(buffer: Buffer, filename: string): Promise<StorageResult> {
  // Never write to disk in serverless (Netlify / Vercel)
  if (process.env.NETLIFY || process.env.VERCEL) {
    throw new Error("Serverless filesystem is ephemeral; inline download mode is used on Netlify.");
  }

  const fs = await import("fs/promises");
  const path = await import("path");

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "pdfs");
  await fs.mkdir(uploadsDir, { recursive: true });

  const timestamp = Date.now();
  const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const finalName = `${timestamp}_${sanitized}`;
  const filePath = path.join(uploadsDir, finalName);
  await fs.writeFile(filePath, buffer);

  const base = env.APP_URL || "http://localhost:3000";
  return { url: `${base}/uploads/pdfs/${finalName}`, key: `pdfs/${finalName}` };
}

export async function deletePDF(key: string): Promise<void> {
  const fs = await import('fs/promises')
  const path = await import('path')
  
  const filePath = path.join(process.cwd(), 'public', 'uploads', key)
  
  try {
    await fs.unlink(filePath)
  } catch (error) {
    console.warn('Failed to delete PDF file:', error)
  }
}
