import type { Snapshot, IgPost } from '../snapshot.types'
import { loadIgConnection } from '@/services/instagram/store'

async function fetchIg<T>(url: string, token: string): Promise<T> {
  const res = await fetch(`${url}${url.includes('?') ? '&' : '?'}access_token=${token}`)
  if (!res.ok) throw new Error(`IG API ${res.status}`)
  return res.json() as Promise<T>
}

export async function instagramSnapshot(workspaceId: string): Promise<Snapshot['instagram']> {
  console.log('📸 instagramSnapshot: Loading connection from database for workspace:', workspaceId)
  
  // Use database connection (same as audit provider)
  const conn = await loadIgConnection(workspaceId)
  
  if (!conn) {
    console.log('📸 instagramSnapshot: No Instagram connection found in database')
    // NO STUB DATA - return undefined if not connected
    return undefined as any
  }
  
  console.log('📸 instagramSnapshot: Connection found:', { igUserId: conn.igUserId, hasToken: !!conn.userAccessToken })

  const base = 'https://graph.facebook.com/v19.0'
  const fields = 'username,followers_count'
  const token = conn.userAccessToken
  
  console.log('📸 instagramSnapshot: Fetching profile data from Instagram API')
  const prof = await fetchIg<{ username:string, followers_count:number }>(`${base}/${conn.igUserId}?fields=${fields}`, token)
  console.log('📸 instagramSnapshot: Profile fetched:', { username: prof.username, followers: prof.followers_count })

  console.log('📸 instagramSnapshot: Fetching media posts')
  const media = await fetchIg<{ data: any[] }>(`${base}/${conn.igUserId}/media?fields=id,timestamp,caption,like_count,comments_count&limit=30`, token)
  const posts: IgPost[] = (media.data ?? []).map(m => ({
    id: m.id,
    timestamp: m.timestamp,
    caption: m.caption,
    likeCount: m.like_count,
    commentsCount: m.comments_count,
  }))

  console.log('📸 instagramSnapshot: Posts fetched:', { count: posts.length })

  const avgEng = posts.length
    ? posts.reduce((a,p)=>a+Number((p.likeCount ?? 0)+(p.commentsCount ?? 0)),0) / posts.length / Math.max(1, prof.followers_count)
    : 0

  const snapshot = {
    igUserId: conn.igUserId,
    username: prof.username,
    followers: prof.followers_count,
    posts,
    avgEngagementRate: avgEng,
  }
  
  console.log('📸 instagramSnapshot: Returning snapshot:', {
    username: snapshot.username,
    followers: snapshot.followers,
    postsCount: snapshot.posts.length,
    avgEngagementRate: snapshot.avgEngagementRate
  })

  return snapshot
}
