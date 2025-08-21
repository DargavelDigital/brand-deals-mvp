import { NextRequest, NextResponse } from 'next/server';
import { isDevelopment } from '@/lib/config';

export async function POST(request: NextRequest) {
  // Only allow in development
  if (!isDevelopment()) {
    return NextResponse.json({ error: 'Demo mode toggle only available in development' }, { status: 403 });
  }

  try {
    const { enabled } = await request.json();
    
    const response = NextResponse.json({ 
      success: true, 
      demoMode: enabled 
    });

    // Set cookie for demo mode
    if (enabled) {
      response.cookies.set('demo', '1', {
        path: '/',
        maxAge: 3600, // 1 hour
        httpOnly: false, // Allow client-side access
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    } else {
      // Remove demo cookie
      response.cookies.set('demo', '', {
        path: '/',
        maxAge: 0,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }

    return response;
  } catch (error) {
    console.error('Demo toggle error:', error);
    return NextResponse.json({ error: 'Failed to toggle demo mode' }, { status: 500 });
  }
}
