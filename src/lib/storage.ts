// Minimal, robust storage for PDFs.
// - On Netlify: use Blobs via getStore().set(...)
// - Locally: write into public/uploads/pdfs
// No external helper imports to avoid bundler/minifier issues.

export type StorageResult = { url: string; key: string };

function isNetlifyRuntime(): boolean {
  // Netlify functions expose these envs in prod
  // Keep detection inline to avoid import shenanigans.
  return !!process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY === "true";
}

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadPDF(buffer: Uint8Array, filename: string): Promise<StorageResult> {
  const ts = Date.now();
  const safeName = sanitize(filename);
  const key = `pdfs/${ts}_${safeName}`;

  if (isNetlifyRuntime()) {
    // NETLIFY: store in Blobs
    const { getStore } = await import("@netlify/blobs");
    const store = getStore("default"); // use default store unless you've named one
    await store.set(key, buffer, { contentType: "application/pdf" });

    // Public URL served by the Next.js site domain:
    // Netlify plugin exposes blobs at /.netlify/blobs/<key>
    const base =
      process.env.NEXT_PUBLIC_APP_ORIGIN ||
      process.env.NEXT_PUBLIC_VERCEL_URL ||
      ""; // empty -> relative URL

    const url = `${base}/.netlify/blobs/${key}`;
    return { url, key };
  }

  // LOCAL DEV: write to public/uploads/pdfs
  const fs = await import("fs/promises");
  const path = await import("path");
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "pdfs");
  await fs.mkdir(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, `${ts}_${safeName}`);
  await fs.writeFile(filePath, buffer);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_ORIGIN ||
    `http://localhost:${process.env.PORT || 3000}`;
  const url = `${baseUrl}/uploads/pdfs/${ts}_${safeName}`;
  return { url, key };
}