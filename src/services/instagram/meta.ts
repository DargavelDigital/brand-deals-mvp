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
 * Generate Facebook OAuth authorization URL for Instagram Business API
 */
export function getAuthUrl({ state }: { state: string }): string {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    redirect_uri: process.env.INSTAGRAM_REDIRECT_URI || `${process.env.APP_URL}/api/instagram/auth/callback`,
    response_type: 'code',
    scope: 'instagram_business_basic,pages_show_list,pages_read_engagement,business_management',
    state: state
  });
  
  return `https://www.facebook.com/v23.0/dialog/oauth?${params.toString()}`;
}

/**
 * Exchange authorization code for Facebook access tokens
 */
export async function exchangeCodeForTokens(code: string) {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    client_secret: process.env.INSTAGRAM_APP_SECRET!,
    redirect_uri: process.env.INSTAGRAM_REDIRECT_URI || `${process.env.APP_URL}/api/instagram/auth/callback`,
    code: code
  });

  console.error('🔴 Facebook token exchange:', {
    endpoint: 'graph.facebook.com/v23.0/oauth/access_token'
  });

  const response = await fetch(`https://graph.facebook.com/v23.0/oauth/access_token?${params.toString()}`, {
    method: 'GET'
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('🔴 Token exchange error:', errorText);
    throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.error('🔴 Facebook token received');
  return data;
}

export async function getInstagramBusinessAccountId(facebookAccessToken: string) {
  console.error('🔴 Getting Instagram Business Account ID from Facebook Page');
  
  // Debug: Check what permissions this token actually has
  const debugResponse = await fetch(
    `https://graph.facebook.com/v23.0/me/permissions?access_token=${facebookAccessToken}`
  );
  const debugData = await debugResponse.json();
  console.error('🔴 Token permissions:', JSON.stringify(debugData, null, 2));
  
  // Get businesses the user has access to
  const businessResponse = await fetch(
    `https://graph.facebook.com/v23.0/me/businesses?access_token=${facebookAccessToken}`
  );

  if (!businessResponse.ok) {
    const errorText = await businessResponse.text();
    console.error('🔴 Failed to get businesses:', errorText);
    throw new Error(`Failed to get businesses: ${businessResponse.status}`);
  }

  const businessData = await businessResponse.json();
  console.error('🔴 Businesses:', JSON.stringify(businessData, null, 2));

  if (!businessData.data || businessData.data.length === 0) {
    throw new Error('No businesses found. Response: ' + JSON.stringify(businessData));
  }

  // Get pages from first business
  const businessId = businessData.data[0].id;
  const pagesResponse = await fetch(
    `https://graph.facebook.com/v23.0/${businessId}/owned_pages?access_token=${facebookAccessToken}`
  );
  
  if (!pagesResponse.ok) {
    const errorText = await pagesResponse.text();
    console.error('🔴 Failed to get Facebook Pages:', errorText);
    throw new Error(`Failed to get Facebook Pages: ${pagesResponse.status}`);
  }
  
  const pagesData = await pagesResponse.json();
  console.error('🔴 Facebook Pages API response:', JSON.stringify(pagesData, null, 2));
  console.error('🔴 Pages data type:', typeof pagesData);
  console.error('🔴 Pages data keys:', Object.keys(pagesData));
  console.error('🔴 Has data property?', 'data' in pagesData);
  console.error('🔴 Data is array?', Array.isArray(pagesData.data));
  console.error('🔴 Data length:', pagesData.data?.length);
  
  if (!pagesData.data || pagesData.data.length === 0) {
    throw new Error(`No Facebook Pages found. Response: ${JSON.stringify(pagesData)} | Data: ${JSON.stringify(pagesData.data)} | Length: ${pagesData.data?.length}`);
  }
  
  // Use first page (user should only have one connected to Instagram)
  const pageId = pagesData.data[0].id;
  const pageAccessToken = pagesData.data[0].access_token;
  
  console.error('🔴 Facebook Page ID:', pageId);
  
  // Step 2: Get Instagram Business Account from Page
  const igResponse = await fetch(
    `https://graph.facebook.com/v23.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
  );
  
  if (!igResponse.ok) {
    const errorText = await igResponse.text();
    console.error('🔴 Failed to get Instagram account from Page:', errorText);
    throw new Error(`Failed to get Instagram account: ${igResponse.status}`);
  }
  
  const igData = await igResponse.json();
  console.error('🔴 Instagram account data:', igData);
  
  if (!igData.instagram_business_account) {
    throw new Error('No Instagram Business Account linked to this Facebook Page');
  }
  
  return {
    instagramAccountId: igData.instagram_business_account.id,
    pageAccessToken: pageAccessToken,
    pageId: pageId
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

export async function getUserProfile(accessToken: string, instagramAccountId: string) {
  console.error('🔴 Fetching Instagram profile:', {
    instagramAccountId: instagramAccountId
  });

  const url = `https://graph.instagram.com/v23.0/${instagramAccountId}?fields=id,username,name,account_type,media_count&access_token=${accessToken}`;
  
  const response = await fetch(url, {
    method: 'GET'
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('🔴 Profile fetch error:', errorText);
    throw new Error(`Profile fetch failed: ${response.status} - ${errorText}`);
  }

  return response.json();
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