import { NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/getAuth';

export async function POST() {
  console.log('🔍 dev-login: Environment variables:', {
    DEV_DEMO_AUTH: process.env.DEV_DEMO_AUTH,
    NEXT_PUBLIC_DEV_DEMO_AUTH: process.env.NEXT_PUBLIC_DEV_DEMO_AUTH,
    ENABLE_DEMO_AUTH: process.env.ENABLE_DEMO_AUTH,
    NODE_ENV: process.env.NODE_ENV
  });
  
  if (!(process.env.DEV_DEMO_AUTH === '1' || 
        process.env.NEXT_PUBLIC_DEV_DEMO_AUTH === '1' || 
        process.env.ENABLE_DEMO_AUTH === '1')) {
    console.log('🔍 dev-login: Access denied - no demo auth enabled');
    return NextResponse.json({ ok: false, error: 'DISABLED' }, { status: 403 });
  }
  
  console.log('🔍 dev-login: Access granted - demo auth enabled');
  
  const ctx = await getAuth(false);
  if (!ctx) {
    // getAuth(false) may still create demo user if DEV_DEMO_AUTH set; call again with required
    const ctx2 = await getAuth(true);
    if (!ctx2) {
      return NextResponse.json({ ok: false, error: 'LOGIN_FAILED' }, { status: 500 });
    }
    
    // Create response with cookies
    const response = NextResponse.json({ 
      ok: true, 
      workspaceId: ctx2.workspaceId, 
      userId: ctx2.user.id, 
      role: ctx2.role 
    });
    
    // Set cookies for the client
    response.cookies.set('uid', ctx2.user.id, { 
      path: '/', 
      httpOnly: false, 
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    response.cookies.set('wsid', ctx2.workspaceId, { 
      path: '/', 
      httpOnly: false, 
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    
    return response;
  }
  
  // Create response with cookies
  const response = NextResponse.json({ 
    ok: true, 
    workspaceId: ctx.workspaceId, 
    userId: ctx.user.id, 
    role: ctx.role 
  });
  
  // Set cookies for the client
  response.cookies.set('uid', ctx.user.id, { 
    path: '/', 
    httpOnly: false, 
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  response.cookies.set('wsid', ctx.workspaceId, { 
    path: '/', 
    httpOnly: false, 
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  
  return response;
}
