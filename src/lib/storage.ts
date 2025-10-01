// src/lib/storage.ts
// Bulletproof v6-only Netlify Blobs uploader.
// Will fail fast if wrong SDK version is bundled.

import { put } from "@netlify/blobs";

type StorageResult = { url: string; key: string };

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadPDF(buffer: Buffer, filename: string): Promise<StorageResult> {
  // Fail fast if put() is not available (wrong SDK version)
  if (typeof put !== "function") {
    throw new Error(
      "Netlify Blobs put() function not available. Expected @netlify/blobs v6+ but got older version. " +
      "Check that external_node_modules = ['@netlify/blobs'] is set in netlify.toml and cache was cleared."
    );
  }

  const key = `pdfs/${Date.now()}_${sanitize(filename)}`;

  try {
    const result = await put(key, buffer, {
      access: "public",
      contentType: "application/pdf",
    });

    // Construct URL if not returned (some older edges)
    const url = result?.url ?? `/.netlify/blobs/${key}`;
    return { url, key };
  } catch (error: any) {
    throw new Error(
      `Netlify Blobs upload failed: ${error?.message || error}. ` +
      "Ensure @netlify/blobs v6+ is properly bundled and cache was cleared."
    );
  }
}