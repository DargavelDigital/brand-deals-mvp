import dayjs from 'dayjs'
import type { Snapshot, YtVideo } from '../snapshot.types'
import { env } from '@/lib/env'

const YT = 'https://www.googleapis.com/youtube/v3'

async function ytGet(path: string, params: Record<string,string>) {
  const key = env.YOUTUBE_API_KEY!
  const url = new URL(`${YT}/${path}`)
  Object.entries({ ...params, key }).forEach(([k,v]) => url.searchParams.set(k,v))
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`YouTube API ${path} ${res.status}`)
  return res.json()
}

export async function youtubeSnapshot(channelId: string): Promise<Snapshot['youtube']> {
  // Channel stats
  const ch = await ytGet('channels', { part: 'snippet,statistics,contentDetails', id: channelId })
  const item = ch.items?.[0]
  if (!item) throw new Error('YT channel not found')

  const uploadsPlaylist = item.contentDetails?.relatedPlaylists?.uploads
  const title = item.snippet?.title
  const url = `https://www.youtube.com/channel/${channelId}`
  const subscribers = Number(item.statistics?.subscriberCount ?? 0)
  const totalViews  = Number(item.statistics?.viewCount ?? 0)

  // Fetch last ~50 videos
  const videos: YtVideo[] = []
  if (uploadsPlaylist) {
    let pageToken: string | undefined
    while (videos.length < 50) {
      const pl = await ytGet('playlistItems', {
        part:'snippet', playlistId: uploadsPlaylist, maxResults:'50', ...(pageToken ? { pageToken } : {})
      })
      for (const it of pl.items ?? []) {
        if (videos.length >= 50) break
        const vidId = it.snippet?.resourceId?.videoId
        if (!vidId) continue
        videos.push({
          id: vidId,
          title: it.snippet?.title ?? '',
          publishedAt: it.snippet?.publishedAt ?? '',
          views: 0,
        })
      }
      pageToken = pl.nextPageToken
      if (!pageToken) break
    }

    if (videos.length) {
      // stats batch (videos endpoint max 50 ids)
      const ids = videos.map(v => v.id).join(',')
      const stats = await ytGet('videos', { part:'statistics', id: ids })
      const map = new Map<string, any>()
      for (const s of stats.items ?? []) map.set(s.id, s.statistics)
      for (const v of videos) {
        const s = map.get(v.id)
        v.views = Number(s?.viewCount ?? 0)
        v.likes = s?.likeCount ? Number(s.likeCount) : undefined
        v.comments = s?.commentCount ? Number(s.commentCount) : undefined
      }
    }
  }

  // crude keyword extraction from titles
  const freq = new Map<string, number>()
  for (const v of videos) {
    const words = (v.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g,' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !['with','from','your','that','this','have','what','about','just','when','like','make','into','their','will'].includes(w))
    for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1)
  }
  const topKeywords = [...freq.entries()].sort((a,b)=>b[1]-a[1]).slice(0,15).map(([w])=>w)

  return {
    channelId, title, url, subscribers, totalViews, videos, topKeywords
  }
}
