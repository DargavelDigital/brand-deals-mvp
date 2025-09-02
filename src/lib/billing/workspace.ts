import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-options';

export async function getSessionAndWorkspace() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.workspaceId) {
    throw new Error('UNAUTHENTICATED');
  }
  const ws = await prisma.workspace.findUnique({
    where: { id: session.user.workspaceId },
    select: { id: true, name: true, plan: true, stripeCustomerId: true }
  });
  if (!ws) throw new Error('WORKSPACE_NOT_FOUND');
  return { session, ws };
}
