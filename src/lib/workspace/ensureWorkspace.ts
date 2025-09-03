import { prisma } from '@/lib/prisma'

export async function ensureWorkspaceForUser(userId: string, workspaceId?: string | null) {
  // If workspaceId provided, verify it exists
  if (workspaceId) {
    const exists = await prisma.workspace.findUnique({ where: { id: workspaceId } })
    if (exists) return exists
  }
  
  // Try find one linked to the user via Membership
  const membership = await prisma.membership.findFirst({
    where: { userId },
    include: { workspace: true }
  })
  if (membership?.workspace) {
    return membership.workspace
  }
  
  // Create a minimal workspace and link user via Membership
  const ws = await prisma.workspace.create({
    data: { name: 'My Workspace' },
  })
  
  await prisma.membership.create({
    data: {
      userId,
      workspaceId: ws.id,
      role: 'CREATOR'
    }
  })
  
  return ws
}
