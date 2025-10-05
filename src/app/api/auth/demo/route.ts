import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('=== DEMO LOGIN: Redirecting to NextAuth credentials signin ===');
    
    // Redirect to NextAuth signin with demo credentials
    // The credentials provider will handle user/workspace creation
    const signinUrl = new URL('/api/auth/signin/credentials', request.url);
    signinUrl.searchParams.set('email', 'creator@demo.local');
    signinUrl.searchParams.set('password', 'demo');
    signinUrl.searchParams.set('callbackUrl', '/en/dashboard');
    
    return NextResponse.redirect(signinUrl);
  } catch (error) {
    console.error('Demo login error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json({ 
      ok: false, 
      error: 'Demo login failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
