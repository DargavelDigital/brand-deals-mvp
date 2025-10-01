// src/lib/storage.ts
// Simple v6-only Netlify Blobs uploader

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