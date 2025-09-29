import { cookies, headers } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-options';

export async function requireSessionOrDemo(_req?: Request) {
  // 1) NextAuth session (primary)
  const session = await getServerSession(authOptions);
  if (session?.user?.workspaceId) {
    return { session, demo: null, workspaceId: session.user.workspaceId };
  }

  // 2) Demo-cookie fallback (kept, harmless if not set)
  const jar = await cookies();
  const demoWs = jar.get('demo-workspace')?.value;
  if (demoWs) {
    return { session: null, demo: { ws: demoWs }, workspaceId: demoWs };
  }

  // 3) Fail
  throw new Error('UNAUTHENTICATED');
}

