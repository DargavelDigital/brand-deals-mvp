import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { encode } from 'next-auth/jwt';

export async function POST(request: Request) {
  try {
    // Create demo user and workspace in the database
    const demoUserId = 'demo-user';
    const demoWorkspaceId = 'demo-workspace';
    
    console.log('=== DEMO LOGIN: Creating database records ===');
    
    // Test Prisma connection first
    try {
      await prisma().$queryRaw`SELECT 1`;
      console.log('✅ Prisma connection test successful');
    } catch (dbError) {
      console.error('❌ Prisma connection test failed:', dbError);
      throw new Error(`Database connection failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
    }
    
    // Create or get demo user
    const user = await prisma().user.upsert({
      where: { email: 'creator@demo.local' },
      update: {},
      create: {
        id: demoUserId,
        email: 'creator@demo.local',
        name: 'Demo Creator',
        updatedAt: new Date(),
      },
      select: { id: true, email: true, name: true }
    });
    console.log('Demo user created/found:', user);

    // Create or get demo workspace
    const workspace = await prisma().workspace.upsert({
      where: { id: demoWorkspaceId },
      update: {},
      create: {
        id: demoWorkspaceId,
        name: 'Demo Workspace',
        slug: 'demo-workspace',
        updatedAt: new Date(),
      },
      select: { id: true, name: true }
    });
    console.log('Demo workspace created/found:', workspace);

    // Create or get membership using the actual user.id
    let membership;
    try {
      membership = await prisma().membership.upsert({
        where: {
          userId_workspaceId: {
            userId: user.id,  // Use actual user.id from the upsert operation
            workspaceId: workspace.id  // Use actual workspace.id from the upsert operation
          }
        },
        update: {},
        create: {
          id: `membership_${user.id}_${workspace.id}`,
          userId: user.id,  // Use actual user.id
          workspaceId: workspace.id,  // Use actual workspace.id
          role: 'OWNER',
          updatedAt: new Date()
        }
      });
      console.log('Demo membership created/found:', membership);
    } catch (membershipError) {
      console.error('❌ Membership creation failed:', membershipError);
      throw new Error(`Membership creation failed: ${membershipError instanceof Error ? membershipError.message : 'Unknown error'}`);
    }

    // Set a simple demo session cookie
    const cookieStore = await cookies();
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

    // Instead of manually creating JWT, redirect to NextAuth signin with demo credentials
    // This will create a proper NextAuth session
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
