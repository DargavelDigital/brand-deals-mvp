import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    // Server-side demo auth
    ENABLE_DEMO_AUTH: process.env.ENABLE_DEMO_AUTH,
    FEATURE_DEMO_AUTH: process.env.FEATURE_DEMO_AUTH,
    
    // Client-side demo auth
    NEXT_PUBLIC_ENABLE_DEMO_AUTH: process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH,
    NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE,
    
    // Other relevant vars
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
  };

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    envVars,
    allDemoVars: Object.keys(process.env).filter(key => 
      key.includes('DEMO') || key.includes('demo')
    ),
  });
}
