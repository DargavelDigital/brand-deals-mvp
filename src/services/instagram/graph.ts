// src/services/instagram/graph.ts

// Minimal, safe wrappers around the Instagram Graph API.
// These functions are imported by audit providers and API routes.
// They succeed softly (configured:false) when env is missing so builds don't break.

type Ok<T> = { ok: true; configured: true; data: T };
type NotConfigured = { ok: false; configured: false; reason: "NOT_CONFIGURED" };
type Fail = { ok: false; configured: true; error: string; status?: number };

type Result<T> = Ok<T> | NotConfigured | Fail;

const META_APP_ID = process.env.META_APP_ID ?? process.env.NEXT_PUBLIC_META_APP_ID;
const META_APP_SECRET =
  process.env.META_APP_SECRET ?? process.env.NEXT_PUBLIC_META_APP_SECRET;

// In your system, access tokens are stored per user/workspace. These helpers
// accept a token param so the caller can pass the right one (short or long-lived).
// If you later centralize token lookups, you can add getToken() here.

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<{ ok: boolean; status: number; json?: T; text?: string }> {
  const res = await fetch(url, { ...init, headers: { Accept: "application/json", ...(init?.headers ?? {}) } });
  const status = res.status;
  const text = await res.text();
  try {
    const json = text ? (JSON.parse(text) as T) : (undefined as unknown as T);
    return { ok: res.ok, status, json, text };
  } catch {
    return { ok: res.ok, status, text };
  }
}

function notConfigured<T>(): Result<T> {
  return { ok: false, configured: false, reason: "NOT_CONFIGURED" as const };
}

/**
 * Exchange a SHORT-LIVED user token for a LONG-LIVED token (valid ~60 days).
 * https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived/#exchangelong
 */
export async function exchangeLongLivedToken(shortLivedToken: string): Promise<Result<{ access_token: string; token_type?: string; expires_in?: number }>> {
  if (!META_APP_ID || !META_APP_SECRET) return notConfigured();
  const url = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", META_APP_ID);
  url.searchParams.set("client_secret", META_APP_SECRET);
  url.searchParams.set("fb_exchange_token", shortLivedToken);

  const res = await fetchJSON<{ access_token: string; token_type?: string; expires_in?: number }>(url.toString());
  if (!res.ok) return { ok: false, configured: true, error: res.text ?? "Token exchange failed", status: res.status };
  return { ok: true, configured: true, data: res.json! };
}

/**
 * Basic account info for the IG Business/User ID.
 * https://developers.facebook.com/docs/instagram-api/reference/ig-user
 */
export async function igAccountInfo(params: { igUserId: string; accessToken: string }): Promise<Result<{
  id: string;
  username?: string;
  followers_count?: number;
  media_count?: number;
  profile_picture_url?: string;
}>> {
  if (!params.accessToken) return notConfigured();
  const fields = ["id", "username", "account_type", "media_count", "followers_count", "profile_picture_url"].join(",");
  const url = `https://graph.instagram.com/v21.0/${params.igUserId}?fields=${fields}&access_token=${encodeURIComponent(params.accessToken)}`;
  
  console.error('🔴 [igAccountInfo] Calling URL:', url.replace(/access_token=[^&]+/, 'access_token=REDACTED'));
  console.error('🔴 [igAccountInfo] IG User ID:', params.igUserId);
  
  const res = await fetchJSON<any>(url);
  
  console.error('🔴 [igAccountInfo] Response status:', res.status);
  console.error('🔴 [igAccountInfo] Response:', res.ok ? 'SUCCESS' : res.text);
  
  if (!res.ok) return { ok: false, configured: true, error: res.text ?? "account info failed", status: res.status };
  return { ok: true, configured: true, data: res.json! };
}

/**
 * Lifetime/day insights on the IG User.
 * https://developers.facebook.com/docs/instagram-api/reference/ig-user/insights/
 * For Instagram Login with Business scopes, use safe metrics.
 */
export async function igUserInsights(params: { igUserId: string; accessToken: string }): Promise<Result<any>> {
  if (!params.accessToken) return notConfigured();
  const metrics = ["follower_count", "impressions", "reach"].join(",");
  const url = `https://graph.instagram.com/v21.0/${params.igUserId}/insights?metric=${metrics}&period=day&access_token=${encodeURIComponent(params.accessToken)}`;
  
  console.error('🔴 [igUserInsights] Calling URL:', url.replace(/access_token=[^&]+/, 'access_token=REDACTED'));
  console.error('🔴 [igUserInsights] IG User ID:', params.igUserId);
  
  const res = await fetchJSON<any>(url);
  
  console.error('🔴 [igUserInsights] Response status:', res.status);
  console.error('🔴 [igUserInsights] Response:', res.ok ? 'SUCCESS' : res.text);
  
  if (!res.ok) return { ok: false, configured: true, error: res.text ?? "user insights failed", status: res.status };
  return { ok: true, configured: true, data: res.json! };
}

/**
 * Audience insights (countries, cities, gender/age).
 * https://developers.facebook.com/docs/instagram-api/reference/ig-user/insights/#audience
 */
export async function igAudienceInsights(params: { igUserId: string; accessToken: string }): Promise<Result<any>> {
  if (!params.accessToken) return notConfigured();
  const metrics = ["audience_city", "audience_country", "audience_gender_age"].join(",");
  const url = `https://graph.instagram.com/v21.0/${params.igUserId}/insights?metric=${metrics}&period=lifetime&access_token=${encodeURIComponent(params.accessToken)}`;
  
  console.error('🔴 [igAudienceInsights] Calling URL:', url.replace(/access_token=[^&]+/, 'access_token=REDACTED'));
  console.error('🔴 [igAudienceInsights] IG User ID:', params.igUserId);
  
  const res = await fetchJSON<any>(url);
  
  console.error('🔴 [igAudienceInsights] Response status:', res.status);
  console.error('🔴 [igAudienceInsights] Response:', res.ok ? 'SUCCESS' : res.text);
  
  if (!res.ok) return { ok: false, configured: true, error: res.text ?? "audience insights failed", status: res.status };
  return { ok: true, configured: true, data: res.json! };
}

/**
 * Recent media list for the user.
 * https://developers.facebook.com/docs/instagram-api/reference/ig-user/media/
 */
export async function igMedia(params: { igUserId: string; accessToken: string; limit?: number }): Promise<Result<{
  data: Array<{
    id: string;
    caption?: string;
    media_type?: string;
    media_url?: string;
    thumbnail_url?: string;
    permalink?: string;
    timestamp?: string;
    like_count?: number;
    comments_count?: number;
  }>;
  paging?: any;
}>> {
  if (!params.accessToken) return notConfigured();
  const fields = [
    "id",
    "caption",
    "media_type",
    "media_url",
    "thumbnail_url",
    "permalink",
    "timestamp",
    "like_count",
    "comments_count",
  ].join(",");
  const url = new URL(`https://graph.instagram.com/v21.0/${params.igUserId}/media`);
  url.searchParams.set("fields", fields);
  if (params.limit) url.searchParams.set("limit", String(params.limit));
  url.searchParams.set("access_token", params.accessToken);

  console.error('🔴 [igMedia] Calling URL:', url.toString().replace(/access_token=[^&]+/, 'access_token=REDACTED'));
  console.error('🔴 [igMedia] IG User ID:', params.igUserId);
  console.error('🔴 [igMedia] Limit:', params.limit || 'default');

  const res = await fetchJSON<any>(url.toString());
  
  console.error('🔴 [igMedia] Response status:', res.status);
  console.error('🔴 [igMedia] Response:', res.ok ? `SUCCESS (${res.json?.data?.length || 0} items)` : res.text);
  
  if (!res.ok) return { ok: false, configured: true, error: res.text ?? "media list failed", status: res.status };
  return { ok: true, configured: true, data: res.json! };
}

/**
 * Insights for a specific media item.
 * https://developers.facebook.com/docs/instagram-api/reference/ig-media/insights/
 */
export async function igMediaInsights(params: { mediaId: string; accessToken: string }): Promise<Result<any>> {
  if (!params.accessToken) return notConfigured();
  const metrics = ["engagement", "impressions", "reach", "saved"].join(",");
  const url = `https://graph.instagram.com/v21.0/${params.mediaId}/insights?metric=${metrics}&access_token=${encodeURIComponent(params.accessToken)}`;
  
  console.error('🔴 [igMediaInsights] Calling URL:', url.replace(/access_token=[^&]+/, 'access_token=REDACTED'));
  console.error('🔴 [igMediaInsights] Media ID:', params.mediaId);
  
  const res = await fetchJSON<any>(url);
  
  console.error('🔴 [igMediaInsights] Response status:', res.status);
  console.error('🔴 [igMediaInsights] Response:', res.ok ? 'SUCCESS' : res.text);
  
  if (!res.ok) return { ok: false, configured: true, error: res.text ?? "media insights failed", status: res.status };
  return { ok: true, configured: true, data: res.json! };
}