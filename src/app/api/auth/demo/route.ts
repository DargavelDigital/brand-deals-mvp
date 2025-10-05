import { NextResponse } from 'next/server';
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

    // After creating user/workspace/membership, create the session token
    const token = await encode({
      token: {
        sub: user.id,
        email: user.email,
        name: user.name || 'Demo Creator',
        workspaceId: workspace.id,
        isDemo: true,
      },
      secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-demo',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    // Set the NextAuth session cookie
    const response = NextResponse.json({ 
      success: true,
      redirectUrl: '/en/dashboard' 
    });

    response.cookies.set('next-auth.session-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
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
