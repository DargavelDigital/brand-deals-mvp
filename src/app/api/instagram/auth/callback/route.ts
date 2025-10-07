import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { log } from '@/lib/logger'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'
import { prisma } from '@/lib/prisma'
import { exchangeCodeForTokens, getUserProfile, getInstagramBusinessAccountId } from '@/services/instagram/meta'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    
    console.error('🔴 Received authorization code:', code?.substring(0, 20) + '...');
    console.error('🔴 Received state:', state);
    console.error('🔴 Full callback URL:', req.url);
    
    // Construct base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || req.url.split('/api')[0]
    console.error('🔴 Instagram callback baseUrl:', {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      APP_URL: process.env.APP_URL,
      reqUrl: req.url,
      constructedBaseUrl: baseUrl
    })

    // Get current workspace ID
    let currentWorkspaceId: string
    try {
      const { workspaceId } = await requireSessionOrDemo(req)
      currentWorkspaceId = workspaceId
    } catch (e) {
      console.error('🔴 CALLBACK ERROR OCCURRED - Workspace ID:', e);
      console.error('🔴 CALLBACK ERROR STACK:', e.stack);
      log.warn({ e }, '[instagram/auth/callback] failed to get workspace ID')
      return NextResponse.redirect(new URL('/settings?instagram_error=1', baseUrl))
    }

    // Verify state
    const cookieStore = await cookies()
    const stateCookie = cookieStore.get('ig_oauth_state')?.value

    if (!code || !state || !stateCookie || state !== stateCookie) {
      console.error('🔴 CALLBACK ERROR OCCURRED - State validation failed:', {
        hasCode: !!code, 
        hasState: !!state, 
        hasStateCookie: !!stateCookie,
        stateMatch: state === stateCookie,
        receivedState: state,
        cookieState: stateCookie
      });
      log.warn({ 
        hasCode: !!code, 
        hasState: !!state, 
        hasStateCookie: !!stateCookie,
        stateMatch: state === stateCookie 
      }, '[instagram/auth/callback] invalid state or missing code')
      return NextResponse.redirect(new URL('/settings?instagram_error=1', baseUrl))
    }

    // Exchange code for Facebook access token
    const tokenData = await exchangeCodeForTokens(code);
    const facebookAccessToken = tokenData.access_token;

    console.error('🔴 Facebook token received, getting Instagram Business Account ID');

    // Get Instagram Business Account ID from linked Facebook Page
    const { instagramAccountId, pageAccessToken } = await getInstagramBusinessAccountId(facebookAccessToken);

    console.error('🔴 Instagram Business Account ID:', instagramAccountId);

    // Get Instagram profile using the Instagram Business Account ID
    const profile = await getUserProfile(pageAccessToken, instagramAccountId);

    console.error('🔴 Instagram profile received:', profile);

    // Store in database with instagramAccountId as the platform_user_id
    // Set expiration for page access token (typically longer than user tokens)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours for page tokens

    // Add error logging for debugging
    console.log('Instagram OAuth callback:', {
      hasCode: !!code,
      hasState: !!state,
      userId: profile?.user_id
    })

    // Upsert SocialAccount with Instagram Business Account data
    await prisma().socialAccount.upsert({
      where: {
        workspaceId_platform: {
          workspaceId: currentWorkspaceId,
          platform: 'instagram'
        }
      },
      update: {
        externalId: instagramAccountId, // Use Instagram Business Account ID
        username: profile.username,
        accessToken: pageAccessToken, // Store page access token
        tokenExpiresAt: expiresAt,
        meta: {
          instagram_business_account_id: instagramAccountId,
          facebook_page_id: pageAccessToken,
          account_type: profile.account_type,
          media_count: profile.media_count,
          // Additional fields can be added later when we expand the profile fetch
        }
      },
      create: {
        workspaceId: currentWorkspaceId,
        platform: 'instagram',
        externalId: instagramAccountId, // Use Instagram Business Account ID
        username: profile.username,
        accessToken: pageAccessToken, // Store page access token
        tokenExpiresAt: expiresAt,
        meta: {
          instagram_business_account_id: instagramAccountId,
          facebook_page_id: pageAccessToken,
          account_type: profile.account_type,
          media_count: profile.media_count,
          // Additional fields can be added later when we expand the profile fetch
        }
      }
    })

    // Clear state cookie
    cookieStore.delete('ig_oauth_state')

    log.info({ 
      currentWorkspaceId, 
      instagramBusinessAccountId: instagramAccountId,
      username: profile.username,
      accountType: profile.account_type,
      mediaCount: profile.media_count,
      expiresAt: expiresAt.toISOString()
    }, '[instagram/auth/callback] Instagram Business Account connection established via Facebook OAuth')

    return NextResponse.redirect(new URL('/dashboard?connected=instagram', baseUrl), { status: 303 })
  } catch (err) {
    console.error('🔴 CALLBACK ERROR OCCURRED - Main catch block:', err);
    console.error('🔴 CALLBACK ERROR STACK:', err.stack);
    log.error({ err }, '[instagram/auth/callback] unhandled error')
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || req.url.split('/api')[0]
    return NextResponse.redirect(new URL('/settings?instagram_error=1', baseUrl))
  }
}