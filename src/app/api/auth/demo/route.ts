import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Create demo user and workspace in the database
    const demoUserId = 'demo-user';
    const demoWorkspaceId = 'demo-workspace';
    
    console.log('=== DEMO LOGIN: Creating database records ===');
    
    // Create or get demo user
    const user = await prisma().user.upsert({
      where: { id: demoUserId },
      update: {},
      create: {
        id: demoUserId,
        email: 'creator@demo.local',
        name: 'Demo Creator',
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
      },
      select: { id: true, name: true }
    });
    console.log('Demo workspace created/found:', workspace);

    // Create or get membership
    const membership = await prisma().membership.upsert({
      where: {
        userId_workspaceId: {
          userId: demoUserId,
          workspaceId: demoWorkspaceId
        }
      },
      update: {},
      create: {
        userId: demoUserId,
        workspaceId: demoWorkspaceId,
        role: 'OWNER'
      }
    });
    console.log('Demo membership created/found:', membership);

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

    return NextResponse.json({ 
      ok: true, 
      message: 'Demo login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: 'CREATOR',
        workspaceId: workspace.id
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
