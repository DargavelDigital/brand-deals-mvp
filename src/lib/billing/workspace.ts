import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-options';

export async function getSessionAndWorkspace() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !(session.user as any).workspaceId) {
    // Return null instead of throwing - let caller handle auth error
    return null;
  }
  const ws = await prisma().workspace.findUnique({
    where: { id: (session.user as any).workspaceId },
    select: { id: true, name: true, plan: true, stripeCustomerId: true }
  });
  if (!ws) {
    // Return null instead of throwing - let caller handle missing workspace
    return null;
  }
  return { session, ws };
}
