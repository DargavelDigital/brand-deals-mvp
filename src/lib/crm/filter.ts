// UTC-safe filter helpers for CRM tabs
export type Tab = 'ALL' | 'UPCOMING' | 'DUE'

export type Deal = {
  id: string
  stage: 'Prospecting' | 'Negotiation' | 'Closed Won' | string
  next?: string | null // ISO string (UTC)
  amount?: number | null
  // Allow additional properties to be compatible with existing deal structures
  [k: string]: any
}

const MS_DAY = 24 * 60 * 60 * 1000

// Parse ISO → epoch ms (undefined if invalid)
export function toEpoch(iso?: string | null): number | undefined {
  if (!iso) return undefined
  const t = Date.parse(iso)
  return Number.isFinite(t) ? t : undefined
}

// Stable "now" epoch from a captured ISO, or Date.now as fallback
export function nowEpoch(nowIso?: string): number {
  return nowIso ? Date.parse(nowIso) : Date.now()
}

// Due = next <= now
export function isDue(iso?: string | null, nowMs?: number): boolean {
  const n = toEpoch(iso)
  if (n === undefined) return true // treat missing as due (matches your current behavior)
  return n <= (nowMs ?? Date.now())
}

// Upcoming = now < next <= now + windowDays
export function isUpcoming(iso?: string | null, windowDays = 14, nowMs?: number): boolean {
  const n = toEpoch(iso)
  if (n === undefined) return false
  const now = nowMs ?? Date.now()
  return n > now && n <= now + windowDays * MS_DAY
}

export function filterByTab<T extends Deal>(deals: T[], tab: Tab, nowIso?: string, windowDays = 14): T[] {
  const nowMs = nowEpoch(nowIso)
  if (tab === 'ALL') return deals
  if (tab === 'UPCOMING') return deals.filter(d => isUpcoming(d.next, windowDays, nowMs))
  if (tab === 'DUE') return deals.filter(d => isDue(d.next, nowMs))
  return deals
}
