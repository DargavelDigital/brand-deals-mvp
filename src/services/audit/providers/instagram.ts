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
    
    // ✅ DEMO WORKSPACE - Return rich mock data to showcase features
    if (workspaceId === 'demo-workspace') {
      console.error('🎁 DEMO WORKSPACE DETECTED - Returning impressive mock Instagram data')
      return {
        audience: {
          size: 156000,                    // Established creator (100K-1M = MACRO tier)
          topGeo: ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany'],
          topAge: ['25-34', '18-24', '35-44'],
          engagementRate: 0.051            // 5.1% - excellent engagement (industry avg: 1-3%)
        },
        performance: {
          avgViews: 89000,                 // Strong reach
          avgLikes: 5200,                  // Healthy engagement
          avgComments: 780,                // Active community
          avgShares: 1200                  // Shareworthy content
        },
        contentSignals: [
          'Visual Storytelling',           // Creative content
          'Behind-the-Scenes',             // Authentic engagement
          'Educational Content',           // Value-driven
          'Product Showcases',             // Brand collaboration ready
          'Lifestyle Content',             // Broad appeal
          'User-Generated Content',        // Community-driven
          'Brand Collaborations'           // Partnership experience
        ]
      }
    }
    
    // ✅ REAL USER FLOW - Continue with actual Instagram API calls
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

    // Check if CRITICAL API calls failed (we need at least account info)
    // Insights can fail - we'll work with what we have!
    if (!info.ok) {
      console.error('🔴 Instagram account info failed - CRITICAL - returning null:', info)
      return null
    }

    // If we don't have media AND don't have insights, we can't generate a useful audit
    if (!media.ok && !user.ok) {
      console.error('🔴 Instagram media AND user insights both failed - returning null:', { 
        media: media.ok ? 'OK' : media,
        user: user.ok ? 'OK' : user
      })
      return null
    }

    console.error('✅ Instagram API calls complete. Working with:', {
      info: '✅',
      user: user.ok ? '✅' : '❌ (will use fallback)',
      audience: audience.ok ? '✅' : '❌ (will use fallback)',
      media: media.ok ? '✅' : '❌ (will use fallback)'
    })

    // Simple reductions (with fallbacks for failed API calls)
    const impressions = user.ok ? sumMetric(user.data, 'impressions') : 0
    const reach = user.ok ? sumMetric(user.data, 'reach') : 0
    const profileViews = user.ok ? sumMetric(user.data, 'profile_views') : 0
    const followerCount = (user.ok ? lastMetric(user.data, 'follower_count') : null) ?? info.data?.followers_count ?? info.data?.media_count ?? 0

    console.error('🔴 Extracted metrics:', { impressions, reach, profileViews, followerCount })

    let likes = 0, comments = 0, saves = 0, engagements = 0
    // Instagram API returns { data: { data: [...posts] } }
    const posts = media?.ok ? (media.data?.data || []) : []
    console.error('🔴 Processing media insights for', posts.length, 'posts')
    console.error('🔴 Media response structure:', media.ok ? { hasData: !!media.data, hasDataData: !!media.data?.data } : 'FAILED')
    
    for (const m of posts) {
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
    const avgLikes = posts.length ? Math.round(likes / posts.length) : 0
    const avgComments = posts.length ? Math.round(comments / posts.length) : 0
    const avgEngagements = posts.length ? Math.round(engagements / posts.length) : 0

    const engagementRate = followerCount ? +(avgEngagements / followerCount).toFixed(4) : 0

    console.error('🔴 Calculating audience breakdowns')
    // Audience breakdowns (best effort - fallback to empty if insights failed)
    const topGeo = audience.ok ? topKeys(audience.data, 'engaged_audience_demographics', 5) : []
    const topAge = audience.ok ? topKeys(audience.data, 'follower_demographics', 5) : []
    console.error('🔴 Audience breakdowns:', { topGeo, topAge })

    console.error('🔴 Inferring content signals from media')
    const contentSignals = inferSignals(posts)
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
