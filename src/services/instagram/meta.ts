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
 */
export function getAuthUrl({ state }: { state: string }): string {
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/auth/callback`;
  
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    redirect_uri: redirectUri,
    scope: 'instagram_business_basic,instagram_business_manage_insights,instagram_business_content_publish',
    response_type: 'code',
    state: state,
  });

  const url = `https://www.instagram.com/oauth/authorize?${params.toString()}`;
  console.error('🔴 Instagram OAuth URL:', url);
  console.error('🔴 Redirect URI:', redirectUri);
  console.error('🔴 NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);

  return url;
}

/**
 * Exchange authorization code for Instagram access tokens
 */
export async function exchangeCodeForTokens(code: string) {
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/auth/callback`;
  
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    client_secret: process.env.INSTAGRAM_APP_SECRET!,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
    code: code,
  });

  const response = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Instagram token exchange failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.error('🔴 Short-lived token response:', JSON.stringify(data, null, 2));
  
  // Exchange short-lived for long-lived token immediately
  const longLivedToken = await getLongLivedToken(data.access_token);
  console.error('🔴 Long-lived token response:', JSON.stringify(longLivedToken, null, 2));
  
  return {
    access_token: longLivedToken.access_token,
    user_id: data.user_id,
  };
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
 */
export async function getUserProfile(accessToken: string, userId: string): Promise<InstagramProfile> {
  console.error('🔴 Fetching profile for userId:', userId);
  console.error('🔴 Using access token (first 20 chars):', accessToken.substring(0, 20) + '...');
  console.error('🔴 Profile API URL:', `https://graph.instagram.com/${userId}?fields=id,username,account_type,media_count`);

  const response = await fetch(
    `https://graph.instagram.com/${userId}?fields=id,username,account_type,media_count&access_token=${accessToken}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get Instagram profile: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  return {
    user_id: data.id,
    username: data.username,
    name: data.username, // Instagram Login doesn't provide name, use username
    account_type: data.account_type,
    media_count: data.media_count,
  };
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
