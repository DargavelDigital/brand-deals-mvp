export async function safeJson(input: string | Request | URL | Response, init?: RequestInit) {
  let res: Response;

  if (input instanceof Response) {
    // Caller already fetched; use it directly
    res = input;
  } else {
    // It's a URL or Request — fetch it
    res = await fetch(input as any, init);
  }

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  return { ok: res.ok, status: res.status, url: (res as any)?.url, body };
}
