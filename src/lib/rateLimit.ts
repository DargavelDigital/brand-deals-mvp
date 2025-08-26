const buckets = new Map<string, { ts: number; count: number }>()
const WINDOW_MS = 60_000
const MAX_REQ = 30

export function rateLimitOk(key: string): boolean {
  const now = Date.now()
  const b = buckets.get(key)
  if (!b || now - b.ts > WINDOW_MS) {
    buckets.set(key, { ts: now, count: 1 }); return true
  }
  if (b.count >= MAX_REQ) return false
  b.count += 1; return true
}
