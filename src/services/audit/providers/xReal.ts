import { loadXConnection } from '@/services/x/store'
import { getMe, getRecentTweets } from '@/services/x/api'

export type AuditData = {
  audience: { size: number; topGeo: string[]; topAge: string[]; engagementRate: number }
  performance: { avgViews: number; avgLikes: number; avgComments: number; avgShares: number }
  contentSignals: string[]
}

export class XRealProvider {
  static async fetchAccountMetrics(workspaceId: string): Promise<AuditData|null>{
    const conn = await loadXConnection(workspaceId)
    if (!conn?.accessToken) return null

    // Profile
    const me = await getMe(conn.accessToken).catch(()=> ({} as any))
    const followers = Number(me?.data?.public_metrics?.followers_count ?? 0)
    const userId = me?.data?.id
    if (!userId) return null

    // Recent tweets (public metrics only)
    const tweets = await getRecentTweets(conn.accessToken, userId, 50).catch(()=> ({} as any))
    const arr: any[] = Array.isArray(tweets?.data) ? tweets.data : []

    let likeSum=0, replySum=0, rtSum=0, quoteSum=0
    for (const t of arr){
      const m = t?.public_metrics || {}
      likeSum += Number(m?.like_count ?? 0)
      replySum += Number(m?.reply_count ?? 0)
      rtSum   += Number(m?.retweet_count ?? 0)
      quoteSum+= Number(m?.quote_count ?? 0)
    }
    const n = Math.max(1, arr.length)
    const avgLikes = Math.round(likeSum/n)
    const avgComments = Math.round(replySum/n)
    const avgShares = Math.round((rtSum+quoteSum)/n)

    // No impressions in public endpoints; approximate "views" with shares+likes+replies as a light proxy
    const avgViews = Math.round((avgLikes + avgComments + avgShares) * 3)

    const engagementRate = followers ? +(((avgLikes+avgComments+avgShares)/followers).toFixed(4)) : 0

    // Simple content signals from text
    const signals = new Set<string>()
    for (const t of arr.slice(0,40)){
      const text: string = String(t?.text || '')
      if (/thread|🧵/i.test(text)) signals.add('Threads')
      if (/(launch|drop|new)/i.test(text)) signals.add('Product Launches')
      if (/(tip|how to|guide)/i.test(text)) signals.add('Educational')
      if (/#ad|#sponsored/i.test(text)) signals.add('Sponsored Content')
      if (/(poll)/i.test(text)) signals.add('Interactive/Polls')
    }

    return {
      audience: { size: followers, topGeo: [], topAge: [], engagementRate },
      performance: { avgViews, avgLikes, avgComments, avgShares },
      contentSignals: Array.from(signals)
    }
  }
}
