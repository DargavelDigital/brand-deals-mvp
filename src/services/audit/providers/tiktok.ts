import { loadTikTokConnection } from '@/services/tiktok/store'
import { getUserInfo, getVideoList, getVideoStats } from '@/services/tiktok/api'

export type AuditData = {
  audience: { size: number; topGeo: string[]; topAge: string[]; engagementRate: number }
  performance: { avgViews: number; avgLikes: number; avgComments: number; avgShares: number }
  contentSignals: string[]
}

export class TikTokProvider {
  static async fetchAccountMetrics(workspaceId: string): Promise<AuditData | null> {
    const conn = await loadTikTokConnection(workspaceId)
    if (!conn?.accessToken) return null

    // User info
    const info = await getUserInfo(conn.accessToken).catch(()=> ({} as any))
    const followers = Number(info?.data?.user?.follower_count ?? 0)

    // Videos (take first page; TikTok paginates)
    const list = await getVideoList(conn.accessToken).catch(()=> ({} as any))
    const videos: any[] = Array.isArray(list?.data?.videos) ? list.data.videos : []

    let totalViews=0, totalLikes=0, totalComments=0, totalShares=0
    const toInspect = videos.slice(0, 20)
    for (const v of toInspect) {
      const id = v?.id || v?.video_id
      if (!id) continue
      const stats = await getVideoStats(conn.accessToken, id).catch(()=> ({} as any))
      const s = stats?.data?.videos?.[0]?.stats || stats?.data?.list?.[0]?.statistics || {}
      totalViews += Number(s?.view_count ?? 0)
      totalLikes += Number(s?.like_count ?? 0)
      totalComments += Number(s?.comment_count ?? 0)
      totalShares += Number(s?.share_count ?? 0)
    }
    const n = Math.max(1, toInspect.length)
    const avgViews = Math.round(totalViews / n)
    const avgLikes = Math.round(totalLikes / n)
    const avgComments = Math.round(totalComments / n)
    const avgShares = Math.round(totalShares / n)
    const engagementRate = followers ? +(((avgLikes+avgComments+avgShares)/followers).toFixed(4)) : 0

    // Simple content signals based on captions/hashtags if available
    const signals = new Set<string>()
    for (const v of toInspect) {
      const cap = String(v?.title || v?.desc || v?.caption || '')
      if (/tutorial|how to|tips/i.test(cap)) signals.add('Educational')
      if (/trend|viral/i.test(cap)) signals.add('Trends')
      if (/#ad|#sponsored/i.test(cap)) signals.add('Sponsored Content')
      if (/behind|bts/i.test(cap)) signals.add('Behind-the-Scenes')
    }

    return {
      audience: { size: followers, topGeo: [], topAge: [], engagementRate },
      performance: { avgViews, avgLikes, avgComments, avgShares },
      contentSignals: Array.from(signals)
    }
  }
}
