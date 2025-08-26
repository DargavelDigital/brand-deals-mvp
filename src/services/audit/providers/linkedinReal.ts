import { loadLinkedInConnection } from '@/services/linkedin/store'
import { orgFollowerStats, orgPageStats, orgUgcPosts, orgShareStats } from '@/services/linkedin/api'

export type AuditData = {
  audience: { size: number; topGeo: string[]; topAge: string[]; engagementRate: number }
  performance: { avgViews: number; avgLikes: number; avgComments: number; avgShares: number }
  contentSignals: string[]
}

export class LinkedInRealProvider {
  static async fetchAccountMetrics(workspaceId: string): Promise<AuditData|null>{
    const conn = await loadLinkedInConnection(workspaceId)
    if (!conn?.accessToken || !conn?.orgUrn) return null
    const token = conn.accessToken
    const orgUrn = conn.orgUrn

    // Followers (size)
    const followers = await orgFollowerStats(token, orgUrn).catch(()=>({ elements:[] }))
    const totalFollowers = (followers.elements?.[0]?.followerCounts?.organicFollowerCount) ?? 0

    // Page stats (reach/engagement) — last few days
    const pageStats = await orgPageStats(token, orgUrn).catch(()=>({ elements:[] }))
    const day = pageStats.elements?.slice?.(-7) || []
    const impressions = avg(day.map((d:any)=> d?.totalPageStatistics?.views?.pageViews?.allPageViews?.pageViewCount))
    const uniqueVisitors = avg(day.map((d:any)=> d?.totalPageStatistics?.views?.pageViews?.allPageViews?.uniquePageViewCount)) || 0

    // Posts + share statistics
    const posts = await orgUgcPosts(token, orgUrn, 10).catch(()=>({ elements:[] }))
    const shares = await orgShareStats(token, orgUrn).catch(()=>({ elements:[] }))

    // Basic per-post averages
    let likeSum=0, commentSum=0, shareSum=0, viewSum=0, n=0
    const shareMap = new Map<string, any>()
    for (const s of shares.elements || []) {
      if (s?.organizationalEntity === orgUrn){
        const key = s?.share || s?.activity || s?.urn
        if (key) shareMap.set(key, s)
      }
    }
    for (const p of posts.elements || []) {
      const urn = p?.id || p?.urn
      const stat = shareMap.get(urn) || {}
      likeSum += Number(stat?.totalShareStatistics?.likeCount ?? 0)
      commentSum += Number(stat?.totalShareStatistics?.commentCount ?? 0)
      shareSum += Number(stat?.totalShareStatistics?.shareCount ?? 0)
      // LinkedIn doesn't expose exact view counts for all posts; proxy with impressions if present
      viewSum += Number(stat?.totalShareStatistics?.impressionCount ?? 0)
      n++
    }
    const avgLikes = n ? Math.round(likeSum/n) : 0
    const avgComments = n ? Math.round(commentSum/n) : 0
    const avgShares = n ? Math.round(shareSum/n) : 0
    const avgViews = n ? Math.round(viewSum/n) : 0

    // Engagement rate proxy
    const engagementRate = totalFollowers ? +(((avgLikes+avgComments+avgShares)/totalFollowers).toFixed(4)) : 0

    // Simple content signals: derive from posts' attributes
    const signals = new Set<string>()
    for (const p of posts.elements || []) {
      const media = p?.specificContent?.['com.linkedin.ugc.ShareContent']?.media || []
      const txt = p?.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text || ''
      if (media?.length > 1) signals.add('Carousel/Album')
      if (/video/i.test(JSON.stringify(media))) signals.add('Video')
      if (/hiring|role|join our/i.test(txt)) signals.add('Hiring Announcements')
      if (/webinar|event/i.test(txt)) signals.add('Events/Webinars')
      if (/case study|report|whitepaper/i.test(txt)) signals.add('Case Studies/Reports')
    }

    return {
      audience: { size: Number(totalFollowers)||0, topGeo: [], topAge: [], engagementRate },
      performance: { avgViews, avgLikes, avgComments, avgShares },
      contentSignals: Array.from(signals)
    }
  }
}

function avg(arr: any[]){
  const a = arr.filter((x)=> typeof x==='number')
  if (!a.length) return 0
  return Math.round(a.reduce((s:number,v:number)=> s+v, 0) / a.length)
}
