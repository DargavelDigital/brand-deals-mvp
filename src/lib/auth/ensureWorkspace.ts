import { prisma } from '@/lib/prisma'

export async function ensureWorkspaceForUser(userId: string) {
  if (!prisma) return null
  
  // Check if user already has a membership
  const existingMembership = await prisma.membership.findFirst({
    where: { userId },
    select: { workspaceId: true },
  })
  
  if (existingMembership?.workspaceId) return existingMembership.workspaceId

  // Get user info for workspace name
  const user = await prisma.user.findUnique({ 
    where: { id: userId }, 
    select: { id: true, name: true } 
  })

  // Create workspace and membership
  const ws = await prisma.workspace.create({
    data: {
      name: (user?.name ?? 'My Workspace').slice(0, 50),
      memberships: {
        create: {
          userId: userId,
          role: 'CREATOR',
        }
      }
    },
    select: { id: true },
  })
  
  return ws.id
}
