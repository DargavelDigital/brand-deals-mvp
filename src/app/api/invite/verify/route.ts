import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
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
      console.error('INVITE_CODE environment variable is not set');
      return NextResponse.json(
        { ok: false, error: 'INVALID_CODE' },
        { status: 400 }
      );
    }

    // Verify the code
    if (code !== validInviteCode) {
      return NextResponse.json(
        { ok: false, error: 'INVALID_CODE' },
        { status: 400 }
      );
    }

    // Set the invite verification cookie
    const cookieStore = cookies();
    const isProduction = process.env.NODE_ENV === 'production';
    
    cookieStore.set('invite_ok', '1', {
      path: '/',
      maxAge: 604800, // 7 days
      secure: isProduction,
      sameSite: 'lax',
      httpOnly: true,
    });

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Invite verification error:', error);
    return NextResponse.json(
      { ok: false, error: 'INVALID_CODE' },
      { status: 400 }
    );
  }
}
