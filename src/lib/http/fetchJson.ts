export async function fetchJson(input: RequestInfo, init: RequestInit = {}) {
  const method = (init.method || 'GET').toUpperCase();
  const headers = new Headers(init.headers || {});
  
  // Auto-add Idempotency-Key for mutating requests
  if (['POST','PUT','PATCH','DELETE'].includes(method) && !headers.has('Idempotency-Key')) {
    headers.set('Idempotency-Key', crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);
  }
  
  const res = await fetch(input, { ...init, headers });
  return res;
}
