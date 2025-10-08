import dayjs from 'dayjs'
import { prisma } from '@/lib/prisma'
import { flags } from '@/lib/flags'

export async function getCachedSnapshot(workspaceId: string, platform: string, externalId: string) {
  const now = new Date()
  const row = await prisma().socialSnapshotCache.findFirst({
    where: {
      workspaceId, platform, externalId,
      expiresAt: { gt: now }
    },
    orderBy: { createdAt: 'desc' },
  })
  return row?.payload ?? null
}

export async function setCachedSnapshot(workspaceId: string, platform: string, externalId: string, payload: any) {
  const ttl = flags.snapshotTtlHours || 6
  const expiresAt = dayjs().add(ttl, 'hour').toDate()
  await prisma().socialSnapshotCache.create({
    data: { 
      id: crypto.randomUUID(),
      workspaceId, 
      platform, 
      externalId, 
      payload, 
      expiresAt 
    }
  })
}
