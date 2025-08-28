import { prisma } from '@/lib/prisma'

export async function softDeleteWorkspace(workspaceId: string, actorUserId?: string) {
  await prisma.$transaction(async (tx) => {
    await tx.workspace.update({ where: { id: workspaceId }, data: { deletedAt: new Date() } })
    await tx.auditLog.create({
      data: { workspaceId, actorUserId, action: 'workspace.soft_delete', targetType: 'Workspace', targetId: workspaceId },
    })
  })
}

export async function purgeDeletedOlderThan(days: number) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const rows = await prisma.workspace.findMany({ where: { deletedAt: { lt: cutoff } }, select: { id: true } })
  for (const w of rows) {
    await prisma.$transaction(async (tx) => {
      // cascade deletes: adjust for your relations
      await tx.membership.deleteMany({ where: { workspaceId: w.id } })
      await tx.encryptedSecret.deleteMany({ where: { workspaceId: w.id } })
      await tx.auditLog.deleteMany({ where: { workspaceId: w.id } })
      await tx.workspace.delete({ where: { id: w.id } })
    })
  }
  return rows.length
}
