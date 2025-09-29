const GRAPH_VERSION = process.env.FACEBOOK_GRAPH_VERSION ?? 'v21.0'
const SCOPE = process.env.INSTAGRAM_SCOPES ?? 'user_profile,user_media'

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface IgAccount {
  id: string
  username: string
  account_type: string
}

interface UserProfile {
  id: string
  username: string
  account_type: string
  media_count: number
}

interface MediaItem {
  id: string
  caption?: string | null
  media_type: string
  media_url?: string
  thumbnail_url?: string
  permalink: string
  timestamp: string
  like_count: number
  comments_count: number
}

/**
 * Generate Instagram OAuth authorization URL
 */
export function getAuthUrl({ state }: { state: string }): string {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    redirect_uri: `${process.env.APP_URL}/api/instagram/auth/callback`,
    response_type: 'code',
    scope: SCOPE,
    state
  })

  return `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${params.toString()}`
}

/**
 * Exchange authorization code for access tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    client_secret: process.env.INSTAGRAM_APP_SECRET!,
    redirect_uri: `${process.env.APP_URL}/api/instagram/auth/callback`,
    code
  })

  const response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Token exchange failed: ${response.status} ${errorText}`)
  }

  return response.json()
}

/**
 * Get user's Instagram account information
 */
export async function getUserIgAccount(accessToken: string): Promise<IgAccount> {
  const response = await fetch(`https://graph.instagram.com/me?fields=id,username,account_type&access_token=${accessToken}`)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to get IG account: ${response.status} ${errorText}`)
  }

  return response.json()
}

/**
 * Get user's Instagram profile with media count
 */
export async function getUserProfile(accessToken: string): Promise<UserProfile> {
  const response = await fetch(`https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to get user profile: ${response.status} ${errorText}`)
  }

  return response.json()
}

/**
 * Get recent media posts from user's Instagram account
 */
export async function getRecentMedia(accessToken: string, limit = 12): Promise<MediaItem[]> {
  const response = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${accessToken}`)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to get recent media: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  
  // Map missing counts to 0 if not present
  return data.data?.map((item: any) => ({
    id: item.id,
    caption: item.caption,
    media_type: item.media_type,
    media_url: item.media_url,
    thumbnail_url: item.thumbnail_url,
    permalink: item.permalink,
    timestamp: item.timestamp,
    like_count: item.like_count ?? 0,
    comments_count: item.comments_count ?? 0
  })) ?? []
}

/**
 * Refresh long-lived access token (stub implementation)
 */
export async function refreshLongLivedToken(accessToken: string): Promise<{ access_token: string; expires_in: number }> {
  // Stub implementation - return input for now
  // TODO: Implement actual token refresh logic
  return {
    access_token: accessToken,
    expires_in: 60 * 24 * 60 * 60 // 60 days in seconds
  }
}
