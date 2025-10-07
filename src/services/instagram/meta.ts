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
 * Generate Instagram OAuth authorization URL using Instagram Basic Display API
 * This gets the auth code, then we use Facebook OAuth for token exchange
 */
export function getAuthUrl({ state }: { state: string }): string {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
    response_type: 'code',
    scope: 'instagram_basic',
    state
  });
  
  return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for Facebook access tokens
 * This gets a Facebook token that can be used to access Instagram Business API
 */
export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  console.error('🔴 Facebook token exchange - Starting with code:', code.substring(0, 20) + '...');
  console.error('🔴 Facebook token exchange - Environment check:', {
    hasClientId: !!process.env.FACEBOOK_APP_ID,
    hasClientSecret: !!process.env.FACEBOOK_APP_SECRET,
    hasRedirectUri: !!process.env.FACEBOOK_REDIRECT_URI,
    clientId: process.env.FACEBOOK_APP_ID?.substring(0, 10) + '...',
    redirectUri: process.env.FACEBOOK_REDIRECT_URI
  });

  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID!,
    client_secret: process.env.FACEBOOK_APP_SECRET!,
    grant_type: 'authorization_code',
    redirect_uri: process.env.FACEBOOK_REDIRECT_URI!,
    code
  });

  console.error('🔴 Facebook token exchange - Making request to Facebook Graph API...');
  const response = await fetch('https://graph.facebook.com/v23.0/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  console.error('🔴 Facebook token exchange - Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('🔴 Facebook token exchange failed:', response.status, errorText);
    throw new Error(`Facebook token exchange failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.error('🔴 Facebook token response:', JSON.stringify(data).substring(0, 200));
  
  // Facebook API returns direct response (not wrapped in data array)
  if (data.access_token) {
    console.error('🔴 Facebook token success:', {
      hasAccessToken: !!data.access_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in
    });
    return {
      access_token: data.access_token,
      user_id: data.user_id // This will be Facebook user ID
    };
  }

  console.error('🔴 Invalid Facebook token response format - data structure:', Object.keys(data));
  throw new Error('Invalid Facebook token response format');
}

/**
 * Get Instagram Business Account ID from Facebook Pages
 * This is required for Instagram Business API - we need to find which Facebook Page
 * has an associated Instagram Business Account
 */
export async function getInstagramBusinessAccountId(facebookAccessToken: string): Promise<string> {
  console.error('🔴 Getting Facebook Pages...');
  
  // First, get all Facebook Pages the user has access to
  const pagesResponse = await fetch(
    `https://graph.facebook.com/v23.0/me/accounts?access_token=${facebookAccessToken}`
  );
  
  if (!pagesResponse.ok) {
    const errorText = await pagesResponse.text();
    console.error('🔴 Facebook Pages fetch failed:', pagesResponse.status, errorText);
    throw new Error(`Facebook Pages fetch failed: ${pagesResponse.status} - ${errorText}`);
  }
  
  const pagesData = await pagesResponse.json();
  console.error('🔴 Facebook Pages response:', JSON.stringify(pagesData).substring(0, 200));
  
  if (!pagesData.data || pagesData.data.length === 0) {
    throw new Error('No Facebook Pages found. User needs to have a Facebook Page with Instagram Business Account.');
  }
  
  // Find the first page with an Instagram Business Account
  for (const page of pagesData.data) {
    console.error('🔴 Checking page for Instagram Business Account:', page.name, page.id);
    
    const instagramResponse = await fetch(
      `https://graph.facebook.com/v23.0/${page.id}?fields=instagram_business_account&access_token=${facebookAccessToken}`
    );
    
    if (instagramResponse.ok) {
      const instagramData = await instagramResponse.json();
      console.error('🔴 Instagram Business Account check:', JSON.stringify(instagramData).substring(0, 200));
      
      if (instagramData.instagram_business_account) {
        const instagramAccountId = instagramData.instagram_business_account.id;
        console.error('🔴 Found Instagram Business Account ID:', instagramAccountId);
        return instagramAccountId;
      }
    }
  }
  
  throw new Error('No Instagram Business Account found. User needs to connect Instagram to a Facebook Page.');
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
 * Get Instagram Business Account profile using Facebook Graph API
 * Requires Instagram Business Account ID from Facebook Pages API
 */
export async function getUserProfile(facebookAccessToken: string, instagramBusinessAccountId: string): Promise<InstagramProfile> {
  // Use minimal fields first to test
  const fields = 'id,username,name,account_type';
  const url = `https://graph.facebook.com/v23.0/${instagramBusinessAccountId}?fields=${fields}&access_token=${facebookAccessToken}`;
  
  console.error('🔴 Fetching Instagram Business profile with Facebook token:', facebookAccessToken.substring(0, 20) + '...');
  console.error('🔴 Instagram Business Account ID:', instagramBusinessAccountId);
  console.error('🔴 Profile URL:', url);
  console.error('🔴 Profile request details:', {
    endpoint: `https://graph.facebook.com/v23.0/${instagramBusinessAccountId}`,
    fields: fields,
    hasAccessToken: !!facebookAccessToken,
    tokenStart: facebookAccessToken?.substring(0, 20)
  });

  const response = await fetch(url);

  console.error('🔴 Profile response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('🔴 Profile fetch error response:', errorText);
    console.error('🔴 Response status:', response.status);
    console.error('🔴 Response headers:', Object.fromEntries(response.headers.entries()));
    throw new Error(`Profile fetch failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.error('🔴 Profile fetch success response:', {
    hasData: !!data,
    dataKeys: Object.keys(data),
    hasUserId: !!data.user_id,
    hasUsername: !!data.username,
    responseStructure: data.data ? 'wrapped_in_data_array' : 'direct_response'
  });
  
  // Response structure: { data: [{ user_id, username, ... }] }
  if (data.data && data.data.length > 0) {
    console.error('🔴 Using wrapped response format');
    return data.data[0];
  }
  
  console.error('🔴 Using direct response format');
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