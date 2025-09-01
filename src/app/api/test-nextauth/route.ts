import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { buildAuthOptions } from '@/lib/auth/nextauth-options';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(buildAuthOptions());
    
    return NextResponse.json({
      success: true,
      session: session ? {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          isDemo: session.user.isDemo
        }
      } : null,
      message: session ? 'Authenticated with NextAuth' : 'No NextAuth session'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'NextAuth test failed'
    });
  }
}
