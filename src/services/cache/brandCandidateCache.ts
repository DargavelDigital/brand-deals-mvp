import { prisma } from '@/lib/prisma';

export async function getCachedCandidates(workspaceId: string, term: string) {
  const row = await prisma().brandCandidateCache.findFirst({
    where: { workspaceId, term, expiresAt: { gt: new Date() } },
  });
  return row?.payload as any || null;
}

export async function setCachedCandidates(workspaceId: string, term: string, payload: any, ttlHours = 24) {
  const expiresAt = new Date(Date.now() + ttlHours*60*60*1000);
  await prisma().brandCandidateCache.create({
    data: { workspaceId, term, payload, expiresAt },
  });
}
