import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { log } from '@/lib/log';
import { withIdempotency } from '@/lib/idempotency';

async function POST_impl(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { code } = body;

    // Validate input
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'INVALID_CODE' },
        { status: 400 }
      );
    }

    // Get invite code from environment
    const validInviteCode = process.env.INVITE_CODE;
    
    // Check if invite code is configured
    if (!validInviteCode) {
      log.error('INVITE_CODE environment variable is not set');
      return NextResponse.json(
        { ok: false, error: 'INVALID_CODE' },
        { status: 400 }
      );
    }

    // Log the invite code for debugging (remove in production)
    log.info('Invite code verification attempt', { 
      providedCode: code, 
      expectedCode: validInviteCode,
      environment: process.env.NEXT_PUBLIC_APP_ENV 
    });

    // Verify the code
    if (code !== validInviteCode) {
      return NextResponse.json(
        { ok: false, error: 'INVALID_CODE' },
        { status: 400 }
      );
    }

    // Set the invite verification cookie
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === 'production';
    
    await cookieStore.set('invite_ok', '1', {
      path: '/',
      maxAge: 604800, // 7 days
      secure: isProduction,
      sameSite: 'lax',
      httpOnly: true,
    });

    return NextResponse.json({ ok: true });

  } catch (error) {
    log.error('Invite verification error:', error);
    return NextResponse.json(
      { ok: false, error: 'INVALID_CODE' },
      { status: 400 }
    );
  }
}

export const POST = withIdempotency(POST_impl);
