import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Set a simple demo session cookie
    const cookieStore = cookies();
    cookieStore.set('demo-session', 'demo-user', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    // Also set a workspace cookie for the contacts API
    cookieStore.set('demo-workspace', 'demo-workspace', {
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
