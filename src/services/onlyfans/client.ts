import { z } from 'zod'
import { OfResult, TOfMetrics, OfMetrics } from './types'

/** Returns which vendor is configured (or 'manual' or null) */
export function resolveOfVendor(): 'ofauth'|'onlyfansapi'|'manual'|null {
  if (process.env.OFAUTH_BASE && process.env.OFAUTH_PUBLIC_KEY) return 'ofauth'
  if (process.env.ONLYFANSAPI_BASE && process.env.ONLYFANSAPI_KEY) return 'onlyfansapi'
  if (process.env.ONLYFANS_ENABLE_MANUAL === 'true') return 'manual'
  return null
}

/** These adapters must NEVER scrape or call private endpoints. */
export async function vendorFetchMetrics(accessToken: string, vendor:'ofauth'|'onlyfansapi'): Promise<OfResult<TOfMetrics>> {
  try {
    if (vendor === 'ofauth'){
      // Example stub call; replace with vendor docs if you sign a contract.
      // const r = await fetch(`${process.env.OFAUTH_BASE}/v1/metrics`, { headers: { Authorization:`Bearer ${accessToken}` }})
      // const j = await r.json()
      // return { ok:true, data: OfMetrics.parse(j) }
      return { ok:false, error:'OFAuth adapter not configured' }
    }
    if (vendor === 'onlyfansapi'){
      // const r = await fetch(`${process.env.ONLYFANSAPI_BASE}/metrics`, { headers: { 'x-api-key': process.env.ONLYFANSAPI_KEY!, Authorization:`Bearer ${accessToken}` }})
      // const j = await r.json()
      // return { ok:true, data: OfMetrics.parse(j) }
      return { ok:false, error:'OnlyFansAPI adapter not configured' }
    }
    return { ok:false, error:'unsupported_vendor' }
  } catch (e:any) {
    return { ok:false, error: e?.message || 'vendor_error' }
  }
}
