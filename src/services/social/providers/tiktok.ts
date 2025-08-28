import type { Snapshot, TtVideo } from '../snapshot.types'

// Plug your own token fetcher
async function getTiktokConnection(workspaceId: string): Promise<{ businessId: string, token: string } | null> {
  // e.g., read from DB or cookie fallback similar to IG
  try {
    const { cookies } = await import('next/headers')
    const raw = cookies().get('tt_conn')?.value
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return { businessId: parsed.businessId, token: parsed.accessToken }
  } catch { return null }
}

export async function tiktokSnapshot(workspaceId: string): Promise<Snapshot['tiktok']> {
  const conn = await getTiktokConnection(workspaceId)
  if (!conn) {
    return {
      businessId: 'stub',
      username: 'demo_tt',
      followers: 15000,
      videos: Array.from({length: 10}).map((_,i)=>({
        id: `stub_${i}`,
        createTime: new Date(Date.now()-i*86400000).toISOString(),
        views: 5000, likes: 400, comments: 20, shares: 15,
      })),
      avgEngagementRate: 0.03,
    }
  }

  // TikTok for Business endpoints differ; below shows shape; adapt to your client.
  // Example placeholder fetches (replace with your real endpoints/scopes):
  const headers = { Authorization: `Bearer ${conn.token}` }

  // followers/username
  const profRes = await fetch(`https://business-api.tiktok.com/open_api/v1.3/insights/user/basic/?business_id=${conn.businessId}`, { headers })
  if (!profRes.ok) throw new Error('TT profile failed')
  const profJson = await profRes.json()
  const username = profJson?.data?.username ?? 'unknown'
  const followers = Number(profJson?.data?.follower_count ?? 0)

  // last N videos
  const vidsRes = await fetch(`https://business-api.tiktok.com/open_api/v1.3/insights/video/list/?business_id=${conn.businessId}&limit=30`, { headers })
  if (!vidsRes.ok) throw new Error('TT videos failed')
  const vidsJson = await vidsRes.json()
  const videos: TtVideo[] = (vidsJson?.data?.list ?? []).map((v:any)=>({
    id: v.video_id, createTime: v.create_time,
    views: Number(v.play_count ?? 0),
    likes: Number(v.like_count ?? 0),
    comments: Number(v.comment_count ?? 0),
    shares: Number(v.share_count ?? 0),
  }))

  const avgEng = videos.length
    ? videos.reduce((a,v)=>a+Number((v.likes??0)+(v.comments??0)+(v.shares??0)),0)/videos.length/Math.max(1,followers)
    : 0

  return { businessId: conn.businessId, username, followers, videos, avgEngagementRate: avgEng }
}
