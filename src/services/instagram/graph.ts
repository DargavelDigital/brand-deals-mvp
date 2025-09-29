import { log } from '@/lib/logger'
import { currentWorkspaceId } from '@/lib/currentWorkspace'
import { loadIgConnection } from './store'

const BASE = "https://graph.facebook.com/v20.0"

export type InstagramAccount = {
  igUserId: string
  token: string
  username: string
  accountId: string
}

export type MediaParams = {
  limit?: number
  after?: string
}

export type CommentsParams = {
  limit?: number
  after?: string
}

export type InsightsParams = {
  since?: string
  until?: string
}

export type InstagramProfile = {
  id: string
  username: string
  profile_picture_url?: string
  followers_count?: number
  media_count?: number
}

export type InstagramMedia = {
  id: string
  caption?: string | null
  media_type: string
  media_url?: string
  permalink: string
  thumbnail_url?: string
  timestamp: string
  like_count?: number
  comments_count?: number
}

export type InstagramComment = {
  id: string
  text: string
  username: string
  timestamp: string
  like_count?: number
}

export type InstagramInsight = {
  name: string
  period: string
  values: Array<{
    value: Record<string, any>
    end_time: string
  }>
}

/**
 * Get Instagram account for current workspace/user
 */
export async function getInstagramAccount(): Promise<InstagramAccount | null> {
  try {
    const workspaceId = await currentWorkspaceId()
    if (!workspaceId) {
      log.warn('[instagram/graph] no workspace ID found')
      return null
    }

    const conn = await loadIgConnection(workspaceId)
    if (!conn) {
      log.debug({ workspaceId }, '[instagram/graph] no Instagram connection found')
      return null
    }

    return {
      igUserId: conn.igUserId,
      token: conn.userAccessToken,
      username: conn.username || 'unknown',
      accountId: conn.pageId
    }
  } catch (error) {
    log.error({ error }, '[instagram/graph] failed to get Instagram account')
    return null
  }
}

/**
 * Generic Instagram Graph API GET request
 */
async function igGet<T>(path: string, token: string, params: Record<string, unknown> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`)
  
  // Add all params to URL
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value))
    }
  })
  
  // Add access token
  url.searchParams.set('access_token', token)

  try {
    const response = await fetch(url.toString(), { 
      cache: 'no-store',
      headers: {
        'User-Agent': 'BrandDeals-MVP/1.0'
      }
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage = data?.error?.message || `Instagram Graph API error: ${response.status}`
      log.error({ 
        status: response.status, 
        error: data?.error,
        path,
        params 
      }, '[instagram/graph] API request failed')
      throw new Error(errorMessage)
    }

    return data as T
  } catch (error) {
    log.error({ error, path, params }, '[instagram/graph] request failed')
    throw error
  }
}

/**
 * Fetch Instagram profile information
 */
export async function fetchProfile(igUserId: string, token: string): Promise<InstagramProfile> {
  return igGet<InstagramProfile>(`/${igUserId}`, token, {
    fields: 'username,profile_picture_url,followers_count,media_count'
  })
}

/**
 * Fetch Instagram media posts
 */
export async function fetchMedia(
  igUserId: string, 
  token: string, 
  params: MediaParams = {}
): Promise<{ data: InstagramMedia[]; paging?: { cursors?: { after?: string } } }> {
  const { limit = 25, after } = params
  
  return igGet<{ data: InstagramMedia[]; paging?: { cursors?: { after?: string } } }>(
    `/${igUserId}/media`, 
    token, 
    {
      fields: 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count',
      limit,
      ...(after && { after })
    }
  )
}

/**
 * Fetch comments for a specific media post
 */
export async function fetchComments(
  mediaId: string, 
  token: string, 
  params: CommentsParams = {}
): Promise<{ data: InstagramComment[]; paging?: { cursors?: { after?: string } } }> {
  const { limit = 50, after } = params
  
  return igGet<{ data: InstagramComment[]; paging?: { cursors?: { after?: string } } }>(
    `/${mediaId}/comments`, 
    token, 
    {
      fields: 'id,text,username,timestamp,like_count',
      limit,
      ...(after && { after })
    }
  )
}

/**
 * Fetch insights for a specific media post
 */
export async function fetchMediaInsights(
  mediaId: string, 
  token: string
): Promise<{ data: InstagramInsight[] }> {
  try {
    return await igGet<{ data: InstagramInsight[] }>(`/${mediaId}/insights`, token, {
      metric: 'impressions,reach,saved,video_views,engagement'
    })
  } catch (error) {
    // Some metrics may not be available for all media types
    log.debug({ mediaId, error }, '[instagram/graph] some media insights not available')
    return { data: [] }
  }
}

/**
 * Fetch account-level insights
 */
export async function fetchAccountInsights(
  igUserId: string, 
  token: string, 
  params: InsightsParams = {}
): Promise<{ data: InstagramInsight[] }> {
  const { since, until } = params
  
  const queryParams: Record<string, unknown> = {
    metric: 'impressions,reach,profile_views,follower_count',
    period: 'day'
  }
  
  if (since) queryParams.since = since
  if (until) queryParams.until = until
  
  try {
    return await igGet<{ data: InstagramInsight[] }>(`/${igUserId}/insights`, token, queryParams)
  } catch (error) {
    // Some insights may not be available for all accounts
    log.debug({ igUserId, error }, '[instagram/graph] some account insights not available')
    return { data: [] }
  }
}