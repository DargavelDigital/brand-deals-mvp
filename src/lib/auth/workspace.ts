import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-options';
import { cookies } from 'next/headers';

/**
 * Get workspace ID without throwing - returns undefined if unauthenticated
 */
export async function getWorkspaceIdOptional(): Promise<string | undefined> {
  try {
    // 1) NextAuth session (primary)
    const session = await getServerSession(authOptions);
    if (session?.user?.workspaceId) {
      return session.user.workspaceId;
    }

    // 2) Demo-cookie fallback
    const jar = cookies();
    const demoWs = jar.get('demo-workspace')?.value;
    if (demoWs) {
      return demoWs;
    }

    return undefined;
  } catch {
    return undefined;
  }
}