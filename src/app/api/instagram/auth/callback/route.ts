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
    console.error('🔴 Attempting Facebook token exchange...');
    let facebookTokenData, instagramBusinessAccountId, profile;
    try {
      facebookTokenData = await exchangeCodeForTokens(code)
      console.error('🔴 Facebook token exchange SUCCESS:', {
        hasToken: !!facebookTokenData.access_token,
        tokenPreview: facebookTokenData.access_token?.substring(0, 20) + '...',
        facebookUserId: facebookTokenData.user_id
      });
      
      // Get Instagram Business Account ID from Facebook Pages
      console.error('🔴 Getting Instagram Business Account ID...');
      instagramBusinessAccountId = await getInstagramBusinessAccountId(facebookTokenData.access_token);
      console.error('🔴 Instagram Business Account ID SUCCESS:', instagramBusinessAccountId);
      
      // Get Instagram Business Account profile using Facebook token and Instagram Business Account ID
      console.error('🔴 Getting Instagram Business profile...');
      profile = await getUserProfile(facebookTokenData.access_token, instagramBusinessAccountId)
      console.error('🔴 Instagram Business profile SUCCESS:', {
        userId: profile?.user_id,
        username: profile?.username,
        accountType: profile?.account_type
      });
      
      // Facebook tokens typically expire in 2 hours, set expiration accordingly
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 2);
      console.error('🔴 Using Facebook token with 2-hour expiration:', expiresAt.toISOString());
      
    } catch (tokenError) {
      console.error('🔴 CALLBACK ERROR OCCURRED - Facebook OAuth flow failed:', tokenError);
      console.error('🔴 CALLBACK ERROR STACK:', tokenError.stack);
      throw tokenError;
    }

    // Add error logging for debugging
    console.log('Instagram OAuth callback:', {
      hasCode: !!code,
      hasState: !!state,
      userId: profile?.user_id
    })

    // Upsert SocialAccount with Facebook token and Instagram Business Account data
    await prisma().socialAccount.upsert({
      where: {
        workspaceId_platform: {
          workspaceId: currentWorkspaceId,
          platform: 'instagram'
        }
      },
      update: {
        externalId: instagramBusinessAccountId, // Use Instagram Business Account ID
        username: profile.username,
        accessToken: facebookTokenData.access_token, // Store Facebook token
        tokenExpiresAt: expiresAt,
        meta: {
          facebook_user_id: facebookTokenData.user_id,
          instagram_business_account_id: instagramBusinessAccountId,
          account_type: profile.account_type,
          // Additional fields can be added later when we expand the profile fetch
        }
      },
      create: {
        workspaceId: currentWorkspaceId,
        platform: 'instagram',
        externalId: instagramBusinessAccountId, // Use Instagram Business Account ID
        username: profile.username,
        accessToken: facebookTokenData.access_token, // Store Facebook token
        tokenExpiresAt: expiresAt,
        meta: {
          facebook_user_id: facebookTokenData.user_id,
          instagram_business_account_id: instagramBusinessAccountId,
          account_type: profile.account_type,
          // Additional fields can be added later when we expand the profile fetch
        }
      }
    })

    // Clear state cookie
    cookieStore.delete('ig_oauth_state')

    log.info({ 
      currentWorkspaceId, 
      facebookUserId: facebookTokenData.user_id,
      instagramBusinessAccountId: instagramBusinessAccountId,
      username: profile.username,
      accountType: profile.account_type,
      expiresAt: expiresAt.toISOString()
    }, '[instagram/auth/callback] Instagram Business connection established via Facebook OAuth')

    return NextResponse.redirect(new URL('/dashboard?connected=instagram', baseUrl), { status: 303 })
  } catch (err) {
    console.error('🔴 CALLBACK ERROR OCCURRED - Main catch block:', err);
    console.error('🔴 CALLBACK ERROR STACK:', err.stack);
    log.error({ err }, '[instagram/auth/callback] unhandled error')
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || req.url.split('/api')[0]
    return NextResponse.redirect(new URL('/settings?instagram_error=1', baseUrl))
  }
}