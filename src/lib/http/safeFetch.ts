export async function safeJson(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init)
  let body: any = null
  try { 
    body = await res.json() 
  } catch { 
    body = null 
  }
  return { ok: res.ok, status: res.status, body }
}
