interface TokenResponse {
  access_token: string
  user_id?: string
  permissions?: string[]
}

interface InstagramProfile {
  user_id: string
  username: string
  name: string
  account_type: string
  profile_picture_url?: string
  followers_count?: number
  follows_count?: number
  media_count?: number
}

interface InstagramMedia {
  id: string
  caption?: string | null
  media_type: string
  media_url?: string
  permalink?: string
  timestamp: string
}

/**
 * Generate Instagram Login authorization URL
 * TODO: Replace with Instagram Login implementation
 */
export function getAuthUrl({ state }: { state: string }): string {
  // This will be replaced with Instagram Login URL
  throw new Error('Instagram Login not yet implemented');
}

/**
 * Exchange authorization code for Instagram access tokens
 * TODO: Replace with Instagram Login implementation
 */
export async function exchangeCodeForTokens(code: string) {
  // This will be replaced with Instagram Login token exchange
  throw new Error('Instagram Login not yet implemented');
}

/**
 * Exchange short-lived token for long-lived token (Facebook tokens)
 */
export async function getLongLivedToken(shortLivedToken: string): Promise<{ access_token: string; expires_in: number }> {
  const url = new URL('https://graph.instagram.com/access_token');
  url.searchParams.append('grant_type', 'ig_exchange_token');
  url.searchParams.append('client_secret', process.env.INSTAGRAM_APP_SECRET!);
  url.searchParams.append('access_token', shortLivedToken);

  console.error('🔴 Long-lived token request URL:', url.toString());
  console.error('🔴 Long-lived token request details:', {
    method: 'GET',
    hasClientSecret: !!process.env.INSTAGRAM_APP_SECRET,
    hasAccessToken: !!shortLivedToken,
    tokenStart: shortLivedToken?.substring(0, 20),
    grantType: 'ig_exchange_token'
  });

  const response = await fetch(url.toString(), {
    method: 'GET'
  });

  console.error('🔴 Long-lived token response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('🔴 Long-lived error:', errorText);
    console.error('🔴 Response status:', response.status);
    console.error('🔴 Response headers:', Object.fromEntries(response.headers.entries()));
    throw new Error(`Long-lived token exchange failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.error('🔴 Long-lived token success response:', {
    hasAccessToken: !!data.access_token,
    expiresIn: data.expires_in,
    tokenPreview: data.access_token?.substring(0, 20) + '...'
  });

  return data;
}

/**
 * Refresh long-lived access token
 */
export async function refreshLongLivedToken(longLivedToken: string): Promise<{ access_token: string; expires_in: number }> {
  const response = await fetch(
    `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${longLivedToken}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Token refresh failed:', response.status, errorText);
    throw new Error(`Token refresh failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Get Instagram user profile
 * TODO: Update for Instagram Login implementation
 */
export async function getUserProfile(accessToken: string): Promise<InstagramProfile> {
  // This will be replaced with Instagram Login profile fetch
  throw new Error('Instagram Login not yet implemented');
}

/**
 * Get recent media posts from user's Instagram account
 */
export async function getRecentMedia(userId: string, accessToken: string, limit: number = 25): Promise<InstagramMedia[]> {
  const response = await fetch(
    `https://graph.instagram.com/v23.0/${userId}/media?fields=id,caption,media_type,media_url,permalink,timestamp&limit=${limit}&access_token=${accessToken}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Media fetch failed:', response.status, errorText);
    throw new Error(`Media fetch failed: ${response.status}`);
  }

  const data = await response.json();
  return data.data || [];
}
