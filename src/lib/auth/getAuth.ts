import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import type { AuthContext } from './types';

// Enable demo auth in development and production (with safeguards)
const DEMO_ENV = process.env.DEV_DEMO_AUTH === '1' || 
                  process.env.NEXT_PUBLIC_DEV_DEMO_AUTH === '1' || 
                  process.env.ENABLE_DEMO_AUTH === '1';

export async function getAuth(required = true): Promise<AuthContext | null> {
  // 1) Try your real auth here (next-auth/jwt/etc). Replace this block when real auth is wired.
  const cookieStore = await cookies();
  const userId = cookieStore.get('uid')?.value || null;
  const wsid = cookieStore.get('wsid')?.value || null;

  console.log('🔍 getAuth debug:', { userId, wsid, DEMO_ENV });

  if (userId && wsid) {
    // real or pre-set cookies
    console.log('🔍 Found cookies, checking membership...');
    const membership = await prisma.membership.findUnique({
      where: { userId_workspaceId: { userId, workspaceId: wsid } },
      include: { user: true },
    });
    if (membership) {
      console.log('🔍 Found valid membership:', membership.role);
      return {
        user: { id: membership.userId, email: membership.user.email ?? 'user@example.com', name: membership.user.name },
        workspaceId: membership.workspaceId,
        role: membership.role as any,
        isDemo: false,
      };
    } else {
      console.log('🔍 No membership found for cookies');
    }
  }

  // 2) Dev/demo fallback
  if (DEMO_ENV) {
    console.log('🔍 Using demo fallback...');
    // ensure demo workspace & user exist
    const demoEmail = 'demo.creator@example.com';
    let user = await prisma.user.findFirst({ where: { email: demoEmail } });
    if (!user) {
      console.log('🔍 Creating demo user...');
      user = await prisma.user.create({
        data: { email: demoEmail, name: 'Demo Creator' },
      });
    } else {
      console.log('🔍 Found existing demo user:', user.id);
    }
    let ws = await prisma.workspace.findFirst({ where: { slug: 'demo-workspace' } });
    if (!ws) {
      console.log('🔍 Creating demo workspace...');
      ws = await prisma.workspace.create({
        data: { name: 'Demo Workspace', slug: 'demo-workspace' },
      });
    } else {
      console.log('🔍 Found existing demo workspace:', ws.id);
    }
    const membership = await prisma.membership.upsert({
      where: { userId_workspaceId: { userId: user.id, workspaceId: ws.id } },
      update: { role: 'OWNER' },
      create: { userId: user.id, workspaceId: ws.id, role: 'OWNER' },
    });
    console.log('🔍 Demo membership created/updated:', membership.role);

    // Note: Cookies are now set in the HTTP response from the dev login endpoint
    // This server-side cookie setting won't affect client requests

    return {
      user: { id: user.id, email: user.email!, name: user.name },
      workspaceId: ws.id,
      role: 'OWNER',
      isDemo: true,
    };
  }

  if (required) return null;
  return null;
}

export async function requireAuth(roles?: Array<'OWNER' | 'MANAGER' | 'MEMBER' | 'VIEWER'>) {
  console.log('🔍 requireAuth called with roles:', roles);
  const ctx = await getAuth(true);
  if (!ctx) {
    console.log('🔍 requireAuth: No auth context found');
    return { ok: false as const, status: 401, error: 'UNAUTHENTICATED' };
  }
  console.log('🔍 requireAuth: Auth context found, role:', ctx.role);
  if (roles && !roles.includes(ctx.role)) {
    console.log('🔍 requireAuth: Role check failed, need:', roles, 'have:', ctx.role);
    return { ok: false as const, status: 403, error: 'FORBIDDEN' };
  }
  console.log('🔍 requireAuth: Success, returning context');
  return { ok: true as const, ctx };
}
