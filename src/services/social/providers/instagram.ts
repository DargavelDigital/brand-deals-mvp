import type { Snapshot, IgPost } from '../snapshot.types'

async function fetchIg<T>(url: string, token: string): Promise<T> {
  const res = await fetch(`${url}${url.includes('?') ? '&' : '?'}access_token=${token}`)
  if (!res.ok) throw new Error(`IG API ${res.status}`)
  return res.json() as Promise<T>
}

// Replace with your own connection retrieval
async function getIgConnection(workspaceId: string): Promise<{ igUserId: string, token: string } | null> {
  try {
    const { cookies } = await import('next/headers')
    const raw = cookies().get('ig_conn')?.value
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return { igUserId: parsed.igUserId, token: parsed.userAccessToken }
  } catch { return null }
}

export async function instagramSnapshot(workspaceId: string): Promise<Snapshot['instagram']> {
  const conn = await getIgConnection(workspaceId)
  if (!conn) {
    // Safe stub mode
    return {
      igUserId: 'stub',
      username: 'demo_ig',
      followers: 10000,
      posts: Array.from({length: 10}).map((_,i)=>({
        id: `stub_${i}`,
        timestamp: new Date(Date.now() - i*86400000).toISOString(),
        likeCount: 250, commentsCount: 10,
      })),
      avgEngagementRate: 0.025,
    }
  }

  const base = 'https://graph.facebook.com/v19.0'
  const fields = 'username,followers_count'
  const prof = await fetchIg<{ username:string, followers_count:number }>(`${base}/${conn.igUserId}?fields=${fields}`, conn.token)

  const media = await fetchIg<{ data: any[] }>(`${base}/${conn.igUserId}/media?fields=id,timestamp,like_count,comments_count&limit=30`, conn.token)
  const posts: IgPost[] = (media.data ?? []).map(m => ({
    id: m.id,
    timestamp: m.timestamp,
    likeCount: m.like_count,
    commentsCount: m.comments_count,
  }))

  const avgEng = posts.length
    ? posts.reduce((a,p)=>a+Number((p.likeCount ?? 0)+(p.commentsCount ?? 0)),0) / posts.length / Math.max(1, prof.followers_count)
    : 0

  return {
    igUserId: conn.igUserId,
    username: prof.username,
    followers: prof.followers_count,
    posts,
    avgEngagementRate: avgEng,
  }
}
