import { z } from 'zod'

const V = process.env.META_GRAPH_VERSION || 'v20.0'
const BASE = `https://graph.facebook.com/${V}`

export async function fbGET<T>(path: string, params: Record<string, any>) {
  const url = new URL(`${BASE}/${path.replace(/^\//,'')}`)
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, String(v)))
  const r = await fetch(url.toString(), { cache: 'no-store' })
  const j = await r.json().catch(()=> ({}))
  if (!r.ok) throw new Error(j?.error?.message || `Graph error: ${r.status}`)
  return j as T
}

export async function exchangeCodeForToken(code: string, redirectUri: string) {
  // short-lived user token
  return fbGET<{ access_token: string; token_type: string; expires_in: number }>('oauth/access_token', {
    client_id: process.env.FACEBOOK_APP_ID!,
    client_secret: process.env.FACEBOOK_APP_SECRET!,
    redirect_uri: redirectUri,
    code
  })
}

export async function exchangeLongLivedToken(short: string) {
  return fbGET<{ access_token: string; token_type: string; expires_in: number }>('oauth/access_token', {
    grant_type: 'fb_exchange_token',
    client_id: process.env.FACEBOOK_APP_ID!,
    client_secret: process.env.FACEBOOK_APP_SECRET!,
    fb_exchange_token: short
  })
}

export async function meAccounts(userToken: string) {
  return fbGET<{ data: { id: string; name: string; access_token: string }[] }>('me/accounts', {
    access_token: userToken
  })
}

export async function pageToIgUserId(pageId: string, token: string) {
  return fbGET<{ instagram_business_account?: { id: string } }>(`${pageId}`, {
    fields: 'instagram_business_account',
    access_token: token
  })
}

export async function igAccountInfo(igUserId: string, token: string) {
  return fbGET<{ id: string; username: string; media_count: number; account_type: string }>(`${igUserId}`, {
    fields: 'id,username,media_count,account_type',
    access_token: token
  })
}

export async function igUserInsights(igUserId: string, token: string) {
  // daily metrics last 30d
  return fbGET<{ data: any[] }>(`${igUserId}/insights`, {
    metric: 'impressions,reach,profile_views,follower_count',
    period: 'day',
    access_token: token
  })
}

export async function igAudienceInsights(igUserId: string, token: string) {
  // audience_* metrics available for qualified accounts
  try {
    return await fbGET<{ data: any[] }>(`${igUserId}/insights`, {
      metric: 'audience_city,audience_gender_age',
      period: 'lifetime',
      access_token: token
    })
  } catch {
    return { data: [] }
  }
}

export async function igMedia(igUserId: string, token: string, limit = 20) {
  return fbGET<{ data: { id: string; caption?: string|null; media_type: string; timestamp: string; like_count?: number; comments_count?: number; permalink: string }[] }>(`${igUserId}/media`, {
    fields: 'id,caption,media_type,timestamp,like_count,comments_count,permalink,media_product_type',
    limit,
    access_token: token
  })
}

export async function igMediaInsights(mediaId: string, token: string) {
  // Metrics differ by media type; this set is broadly available
  try {
    return await fbGET<{ data: any[] }>(`${mediaId}/insights`, {
      metric: 'engagement,impressions,reach,saved',
      access_token: token
    })
  } catch {
    return { data: [] }
  }
}
