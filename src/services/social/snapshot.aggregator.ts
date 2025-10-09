import type { Snapshot } from './snapshot.types'
import { youtubeSnapshot } from './providers/youtube'
import { instagramSnapshot } from './providers/instagram'
import { tiktokSnapshot } from './providers/tiktok'
import { getCachedSnapshot, setCachedSnapshot } from './snapshot.cache'
import { flags } from '@/lib/flags'

export type BuildOpts = {
  workspaceId: string
  youtube?: { channelId?: string }
  instagram?: { enabled?: boolean } // we discover ig user id via connection
  tiktok?: { enabled?: boolean }    // we discover tt business id via connection
}

export async function buildSnapshot(opts: BuildOpts): Promise<Snapshot> {
  const out: Snapshot = {}

  // YouTube
  if (flags.social.youtube && opts.youtube?.channelId) {
    const chId = opts.youtube.channelId
    const cached = await getCachedSnapshot(opts.workspaceId, 'youtube', chId)
    let payload = cached
    if (!payload) {
      payload = await youtubeSnapshot(chId)
      await setCachedSnapshot(opts.workspaceId, 'youtube', chId, payload)
    }
    out.youtube = payload
  }

  // Instagram (externalId comes from connection within provider; we use 'workspace' as key)
  if (flags.social.instagram) {
    const live = await instagramSnapshot(opts.workspaceId)
    
    // Only include if actually connected (live will be undefined if not connected)
    if (live && live.igUserId) {
      const key = live.igUserId
      const cached = await getCachedSnapshot(opts.workspaceId, 'instagram', key)
      if (!cached) {
        await setCachedSnapshot(opts.workspaceId, 'instagram', key, live)
        out.instagram = live
      } else {
        out.instagram = cached
      }
    }
    // If undefined, skip Instagram (not connected)
  }

  // TikTok
  if (flags.social.tiktok) {
    const live = await tiktokSnapshot(opts.workspaceId)
    
    // Only include if actually connected (live will be undefined if not connected)
    if (live && live.businessId) {
      const key = live.businessId
      const cached = await getCachedSnapshot(opts.workspaceId, 'tiktok', key)
      if (!cached) {
        await setCachedSnapshot(opts.workspaceId, 'tiktok', key, live)
        out.tiktok = live
      } else {
        out.tiktok = cached
      }
    }
    // If undefined, skip TikTok (not connected)
  }

  // derived
  const engs: number[] = []
  if (out.instagram?.avgEngagementRate) engs.push(out.instagram.avgEngagementRate)
  if (out.tiktok?.avgEngagementRate) engs.push(out.tiktok.avgEngagementRate)
  out.derived = {
    contentThemes: out.youtube?.topKeywords ?? [],
    globalEngagementRate: engs.length ? engs.reduce((a,b)=>a+b,0)/engs.length : undefined,
  }

  return out
}
