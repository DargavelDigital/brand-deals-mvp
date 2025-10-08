import { igAccountInfo, igUserInsights, igAudienceInsights, igMedia, igMediaInsights } from '@/services/instagram/graph'
import { loadIgConnection } from '@/services/instagram/store'

export type AuditData = {
  audience: {
    size: number,
    topGeo: string[],
    topAge: string[],
    engagementRate: number
  },
  performance: {
    avgViews: number,
    avgLikes: number,
    avgComments: number,
    avgShares: number
  },
  contentSignals: string[]
}

export class InstagramProvider {
  /** Returns null if not connected (lets the aggregator fall back to stub). */
  static async fetchAccountMetrics(workspaceId: string): Promise<AuditData | null> {
    console.error('🔴🔴🔴 INSTAGRAM AUDIT STARTED 🔴🔴🔴')
    console.error('🔴 workspaceId:', workspaceId)
    
    const conn = await loadIgConnection(workspaceId)
    console.error('🔴 socialAccount found:', !!conn)
    console.error('🔴 socialAccount data:', conn ? JSON.stringify(conn, null, 2) : 'NO ACCOUNT FOUND')
    
    if (!conn) {
      console.error('🔴 NO INSTAGRAM CONNECTION - RETURNING NULL')
      return null
    }

    const token = conn.userAccessToken
    
    console.error('🔴 Calling Instagram API: igAccountInfo')
    const info = await igAccountInfo({ igUserId: conn.igUserId, accessToken: token })
    console.error('🔴 API result - igAccountInfo:', JSON.stringify(info, null, 2))
    
    console.error('🔴 Calling Instagram API: igUserInsights')
    const user = await igUserInsights({ igUserId: conn.igUserId, accessToken: token })
    console.error('🔴 API result - igUserInsights:', JSON.stringify(user, null, 2))
    
    console.error('🔴 Calling Instagram API: igAudienceInsights')
    const audience = await igAudienceInsights({ igUserId: conn.igUserId, accessToken: token })
    console.error('🔴 API result - igAudienceInsights:', JSON.stringify(audience, null, 2))
    
    console.error('🔴 Calling Instagram API: igMedia')
    const media = await igMedia({ igUserId: conn.igUserId, accessToken: token, limit: 20 })
    console.error('🔴 API result - igMedia:', JSON.stringify(media, null, 2))

    // Check if any API call failed
    if (!info.ok || !user.ok || !audience.ok || !media.ok) {
      console.error('🔴 Instagram API calls failed - returning null:', { 
        info: info.ok, 
        user: user.ok, 
        audience: audience.ok, 
        media: media.ok,
        infoError: !info.ok ? info : undefined,
        userError: !user.ok ? user : undefined,
        audienceError: !audience.ok ? audience : undefined,
        mediaError: !media.ok ? media : undefined
      })
      return null
    }

    // Simple reductions
    const impressions = sumMetric(user.data, 'impressions')
    const reach = sumMetric(user.data, 'reach')
    const profileViews = sumMetric(user.data, 'profile_views')
    const followerCount = lastMetric(user.data, 'follower_count') ?? info.data?.media_count ?? 0

    let likes = 0, comments = 0, saves = 0, engagements = 0
    console.error('🔴 Processing media insights for', media.data.length, 'posts')
    for (const m of media.data) {
      console.error('🔴 Calling Instagram API: igMediaInsights for media', m.id)
      const ins = await igMediaInsights({ mediaId: m.id, accessToken: token })
      console.error('🔴 API result - igMediaInsights:', ins.ok ? 'SUCCESS' : JSON.stringify(ins, null, 2))
      likes += m.like_count ?? 0
      comments += m.comments_count ?? 0
      if (ins.ok) {
        engagements += readMetric(ins.data, 'engagement') ?? 0
        saves += readMetric(ins.data, 'saved') ?? 0
      }
    }
    console.error('🔴 Media insights processing complete:', { totalLikes: likes, totalComments: comments, totalEngagements: engagements, totalSaves: saves })
    const avgLikes = media.data.length ? Math.round(likes / media.data.length) : 0
    const avgComments = media.data.length ? Math.round(comments / media.data.length) : 0
    const avgEngagements = media.data.length ? Math.round(engagements / media.data.length) : 0

    const engagementRate = followerCount ? +(avgEngagements / followerCount).toFixed(4) : 0

    console.error('🔴 Calculating audience breakdowns')
    // Audience breakdowns (best effort)
    const topGeo = topKeys(audience.data, 'audience_city', 5)
    const topAge = topKeys(audience.data, 'audience_gender_age', 5)
    console.error('🔴 Audience breakdowns:', { topGeo, topAge })

    console.error('🔴 Inferring content signals from media')
    const contentSignals = inferSignals(media.data)
    console.error('🔴 Content signals:', contentSignals)

    const result = {
      audience: { size: followerCount, topGeo, topAge, engagementRate },
      performance: {
        avgViews: Math.max(reach, impressions) / 30 /* rough daily avg */,
        avgLikes,
        avgComments,
        avgShares: saves // proxy
      },
      contentSignals
    }

    console.error('🔴 Instagram audit - FINAL RESULT:', {
      audienceSize: result.audience.size,
      engagementRate: result.audience.engagementRate,
      avgLikes: result.performance.avgLikes,
      avgComments: result.performance.avgComments,
      contentSignalsCount: result.contentSignals.length
    })

    return result
  }
}

function readMetric(arr: any[], name: string): number | undefined {
  const e = arr?.find?.((x:any)=> x?.name === name)
  if (!e) return undefined
  const v = Array.isArray(e.values) ? e.values.at(-1) : undefined
  const val = v?.value
  return typeof val === 'number' ? val : undefined
}
function sumMetric(arr:any[], name:string){ 
  const e = arr?.find?.((x:any)=> x?.name === name)
  if (!e?.values) return 0
  return e.values.reduce((a:any,b:any)=> a + (typeof b?.value === 'number' ? b.value : 0), 0)
}
function lastMetric(arr:any[], name:string){
  const e = arr?.find?.((x:any)=> x?.name === name)
  const v = Array.isArray(e?.values) ? e.values.at(-1) : undefined
  return typeof v?.value === 'number' ? v.value : undefined
}
function topKeys(data:any[], metric:string, n:number){
  const e = data?.find?.((x:any)=> x?.name === metric)
  const v = e?.values?.[0]?.value
  if (!v || typeof v !== 'object') return []
  return Object.entries(v).sort((a:any,b:any)=> b[1]-a[1]).slice(0,n).map(([k])=>String(k))
}
function inferSignals(media: { caption?: string|null; media_type: string }[]) {
  const tags = new Set<string>()
  for (const m of media) {
    if (m.media_type === 'REEL') tags.add('Short-form Video')
    if (m.media_type === 'CAROUSEL_ALBUM') tags.add('Carousel')
    if ((m.caption || '').match(/behind|bts/i)) tags.add('Behind-the-Scenes')
    if ((m.caption || '').match(/tutorial|how to|tips/i)) tags.add('Educational')
    if ((m.caption || '').match(/launch|drop|sale/i)) tags.add('Product Launches')
  }
  return Array.from(tags)
}
