// src/lib/storage.ts
// Neon-backed PDF storage with Netlify Blobs fallback

import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

type StorageResult = { url: string; key: string };

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadPDF(buffer: Buffer, filename: string): Promise<StorageResult> {
  // Dynamic import to ensure we get the bundled version
  const { put } = await import("@netlify/blobs");
  
  // Fail fast if put() is not available
  if (typeof put !== "function") {
    throw new Error(
      "Netlify Blobs put() function not available. Expected @netlify/blobs v6+ but got older version."
    );
  }

  const key = `pdfs/${Date.now()}_${sanitize(filename)}`;

  try {
    const result = await put(key, buffer, {
      access: "public",
      contentType: "application/pdf",
    });

    // Construct URL if not returned
    const url = result?.url ?? `/.netlify/blobs/${key}`;
    return { url, key };
  } catch (error: any) {
    throw new Error(`Netlify Blobs upload failed: ${error?.message || error}`);
  }
}

export type DbStorageResult = { 
  url: string; 
  id: string; 
};

export async function uploadPDFToDb(
  buffer: Buffer, 
  filename: string, 
  mimeType = "application/pdf"
): Promise<DbStorageResult> {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error("uploadPDFToDb: buffer must be a Buffer");
  }

  const id = nanoid();
  const url = `/api/media-pack/file/${id}`;

  try {
    await prisma().mediaPackFile.create({
      data: {
        id,
        filename: sanitize(filename),
        mimeType,
        size: buffer.length,
        data: buffer,
        userId: "system", // Will be updated by caller with actual user ID
        workspaceId: "system", // Will be updated by caller with actual workspace ID
      },
    });

    return { url, id };
  } catch (error: any) {
    throw new Error(`Database upload failed: ${error?.message || error}`);
  }
}