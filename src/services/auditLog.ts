import { prisma } from '@/lib/prisma'

export async function logAction(workspaceId: string, actorUserId: string | null, action: string, meta?: any, target?: { type?: string, id?: string }) {
  await prisma.auditLog.create({
    data: {
      workspaceId,
      actorUserId: actorUserId ?? undefined,
      action,
      targetType: target?.type,
      targetId: target?.id,
      meta,
    }
  })
}
