import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';

export async function POST() {
  try {
    // Create a demo JWT token
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
    const token = await new SignJWT({
      user: {
        id: 'demo-user',
        email: 'creator@demo.local',
        name: 'Demo User',
        role: 'CREATOR',
        isDemo: true,
        workspaceId: 'demo-workspace'
      }
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    // Set the NextAuth session cookie
    const cookieStore = cookies();
    cookieStore.set('next-auth.session-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    return NextResponse.json({ 
      ok: true, 
      message: 'Demo login successful',
      user: {
        id: 'demo-user',
        email: 'creator@demo.local',
        name: 'Demo User',
        role: 'CREATOR',
        workspaceId: 'demo-workspace'
      }
    });
  } catch (error) {
    console.error('Demo login error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Demo login failed' 
    }, { status: 500 });
  }
}
