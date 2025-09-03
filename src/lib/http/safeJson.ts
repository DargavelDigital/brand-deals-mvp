export async function safeJson(input: string | Request | URL | Response, init?: RequestInit) {
  let res: Response;

  // Add validation to catch potential issues
  if (input instanceof Response) {
    // Caller already fetched; use it directly
    res = input;
  } else {
    // Validate that input is not accidentally a Response object
    if (typeof input === 'object' && input !== null && 'status' in input) {
      console.error('safeJson: Detected Response-like object passed as URL:', input);
      throw new Error('Invalid input: Response object passed where URL expected');
    }
    
    // It's a URL or Request — fetch it
    res = await fetch(input as any, init);
  }

  let body: any = null;
  try {
    body = await res.json();
  } catch (error) {
    // More detailed error logging
    console.warn('safeJson: Failed to parse JSON response', { 
      url: res.url, 
      status: res.status, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    body = null;
  }

  return { ok: res.ok, status: res.status, url: res.url, body };
}
