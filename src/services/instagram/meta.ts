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
 * Generate Instagram OAuth authorization URL using Instagram Login API
 */
export function getAuthUrl({ state }: { state: string }): string {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
    response_type: 'code',
    scope: 'instagram_business_basic,instagram_business_content_publish,instagram_business_manage_comments',
    state
  });
  
  return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access tokens using Instagram Login API
 */
export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    client_secret: process.env.INSTAGRAM_APP_SECRET!,
    grant_type: 'authorization_code',
    redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
    code
  });

  const response = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Instagram token exchange failed:', response.status, errorText);
    throw new Error(`Token exchange failed: ${response.status}`);
  }

  const data = await response.json();
  
  // Response structure: { data: [{ access_token, user_id, permissions }] }
  if (data.data && data.data.length > 0) {
    const tokenData = data.data[0];
    return {
      access_token: tokenData.access_token,
      user_id: tokenData.user_id,
      permissions: tokenData.permissions
    };
  }
  
  throw new Error('Invalid token response format');
}

/**
 * Exchange short-lived token for long-lived token
 */
export async function getLongLivedToken(shortLivedToken: string): Promise<{ access_token: string; expires_in: number }> {
  const response = await fetch(
    `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_APP_SECRET}&access_token=${shortLivedToken}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Long-lived token exchange failed:', response.status, errorText);
    throw new Error(`Long-lived token exchange failed: ${response.status}`);
  }

  return response.json();
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
 * Get user's Instagram profile using Instagram Graph API
 */
export async function getUserProfile(accessToken: string): Promise<InstagramProfile> {
  const response = await fetch(
    `https://graph.instagram.com/v23.0/me?fields=user_id,username,name,account_type,profile_picture_url,followers_count,follows_count,media_count&access_token=${accessToken}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Profile fetch failed:', response.status, errorText);
    throw new Error(`Profile fetch failed: ${response.status}`);
  }

  const data = await response.json();
  
  // Response structure: { data: [{ user_id, username, ... }] }
  if (data.data && data.data.length > 0) {
    return data.data[0];
  }
  
  return data; // Sometimes direct response, not wrapped in data array
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

// Legacy functions for backward compatibility
export async function getUserIgAccount(accessToken: string): Promise<{ id: string; username: string; account_type: string }> {
  const profile = await getUserProfile(accessToken);
  return {
    id: profile.user_id,
    username: profile.username,
    account_type: profile.account_type
  };
}