import { prisma } from '@/lib/prisma';

export async function getCachedCandidates(workspaceId: string, term: string) {
  const row = await prisma().brandCandidateCache.findFirst({
    where: { workspaceId, term, expiresAt: { gt: new Date() } },
  });
  return row?.payload as any || null;
}

export async function setCachedCandidates(workspaceId: string, term: string, payload: any, ttlHours = 24) {
  // Generate unique ID for cache entry
  const cacheId = `cache_${workspaceId}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  
  const expiresAt = new Date(Date.now() + ttlHours*60*60*1000);
  const refreshedAt = new Date();
  
  await prisma().brandCandidateCache.create({
    data: { 
      id: cacheId,
      workspaceId, 
      term, 
      payload, 
      expiresAt,
      refreshedAt
    },
  });
}
