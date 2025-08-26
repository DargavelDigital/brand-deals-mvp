import { loadOfConnection } from '@/services/onlyfans/store'

export type AuditData = {
  audience: { size: number; topGeo: string[]; topAge: string[]; engagementRate: number }
  performance: { avgViews: number; avgLikes: number; avgComments: number; avgShares: number }
  contentSignals: string[]
}

export class OnlyFansProvider {
  static async fetchAccountMetrics(workspaceId: string): Promise<AuditData|null>{
    const conn = await loadOfConnection(workspaceId)
    if (!conn) return null

    // Call our public metrics endpoint (vendor or manual).
    const r = await fetch('/api/onlyfans/metrics', { cache:'no-store' })
    if (!r.ok) return null
    const { ok, data } = await r.json()

    if (!ok || !data) return null

    // Map OnlyFans metrics to our generic AuditData shape.
    const subs = Number(data?.audience?.subs ?? 0)
    const avgLikes = Number(data?.performance?.avgLikes ?? 0)
    const avgComments = Number(data?.performance?.avgComments ?? 0)
    const avgShares = Number(data?.performance?.avgMessages ?? 0) // proxy
    const engagementRate = subs ? +(((avgLikes+avgComments+avgShares)/subs).toFixed(4)) : 0

    return {
      audience: { size: subs, topGeo: data?.audience?.topGeo || [], topAge: [], engagementRate },
      performance: {
        avgViews: Math.round((avgLikes+avgComments+avgShares) * 2), // light proxy
        avgLikes, avgComments, avgShares
      },
      contentSignals: data?.contentSignals || []
    }
  }
}
