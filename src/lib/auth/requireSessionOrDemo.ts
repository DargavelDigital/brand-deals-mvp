import { cookies, headers } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-options';

export async function requireSessionOrDemo(_req?: Request) {
  // 1) NextAuth session (primary)
  const session = await getServerSession(authOptions);
  if (session?.user?.workspaceId) {
    return { session, demo: null, workspaceId: session.user.workspaceId };
  }

  // 2) No demo fallback - fail gracefully
  // API routes should check for null and return proper 401 response
  return null;
}

