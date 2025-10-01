import type { ReadableStream as WebReadableStream } from "stream/web";

type StorageResult = { url: string; key: string };

function isNetlifyRuntime() {
  // Covers Netlify's Node lambdas
  return !!(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);
}

function getPublicBaseURL() {
  // Netlify sets one of these in functions
  // URL is preferred (primary site URL), fallback to DEPLOY_URL
  return process.env.URL || process.env.DEPLOY_URL || "";
}

/**
 * Uploads a PDF buffer to Netlify Blobs at key `pdfs/<filename>`.
 * Returns { url, key } where url is a public path (relative) that works behind the same origin.
 */
export async function uploadPDF(buffer: Buffer, filename: string): Promise<StorageResult> {
  const key = `pdfs/${filename}`;

  // Try SDK first
  if (isNetlifyRuntime()) {
    try {
      const mod = await import("@netlify/blobs");
      const put = (mod as any)?.put;
      if (typeof put === "function") {
        const res = await put(key, buffer, { contentType: "application/pdf" });
        // Some SDK versions return void; we always return our own URL format
        return { url: `/.netlify/blobs/${key}`, key };
      }
    } catch {
      // fall through to HTTP PUT
    }
  }

  // Fallback: HTTP PUT to the Blobs endpoint
  const base = getPublicBaseURL();
  // If base exists, use absolute URL; else use relative (still works behind same site)
  const absolute = base ? `${base}/.netlify/blobs/${key}` : `/.netlify/blobs/${key}`;

  const resp = await fetch(absolute, {
    method: "PUT",
    headers: { "content-type": "application/pdf" },
    body: buffer as unknown as WebReadableStream | ArrayBuffer | Blob,
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Netlify Blobs HTTP PUT failed: ${resp.status} ${resp.statusText} ${text}`);
  }

  return { url: `/.netlify/blobs/${key}`, key };
}