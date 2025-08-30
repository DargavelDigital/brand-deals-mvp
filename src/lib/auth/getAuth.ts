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

  if (userId && wsid) {
    // real or pre-set cookies
    const membership = await prisma.membership.findUnique({
      where: { userId_workspaceId: { userId, workspaceId: wsid } },
      include: { user: true },
    });
    if (membership) {
      return {
        user: { id: membership.userId, email: membership.user.email ?? 'user@example.com', name: membership.user.name },
        workspaceId: membership.workspaceId,
        role: membership.role as any,
        isDemo: false,
      };
    }
  }

  // 2) Dev/demo fallback
  if (DEMO_ENV) {
    // ensure demo workspace & user exist
    const demoEmail = 'demo.creator@example.com';
    let user = await prisma.user.findFirst({ where: { email: demoEmail } });
    if (!user) {
      user = await prisma.user.create({
        data: { email: demoEmail, name: 'Demo Creator' },
      });
    }
    let ws = await prisma.workspace.findFirst({ where: { slug: 'demo-workspace' } });
    if (!ws) {
      ws = await prisma.workspace.create({
        data: { name: 'Demo Workspace', slug: 'demo-workspace' },
      });
    }
    const membership = await prisma.membership.upsert({
      where: { userId_workspaceId: { userId: user.id, workspaceId: ws.id } },
      update: { role: 'OWNER' },
      create: { userId: user.id, workspaceId: ws.id, role: 'OWNER' },
    });

    // set cookies so future requests are "logged in"
    const cookieStore = await cookies();
    cookieStore.set('uid', user.id, { path: '/', httpOnly: false, sameSite: 'lax' });
    cookieStore.set('wsid', ws.id, { path: '/', httpOnly: false, sameSite: 'lax' });

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
  const ctx = await getAuth(true);
  if (!ctx) {
    return { ok: false as const, status: 401, error: 'UNAUTHENTICATED' };
  }
  if (roles && !roles.includes(ctx.role)) {
    return { ok: false as const, status: 403, error: 'FORBIDDEN' };
  }
  return { ok: true as const, ctx };
}
