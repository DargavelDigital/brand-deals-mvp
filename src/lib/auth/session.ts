import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import type { AppRole, SessionUser } from './types'

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    // Replace with your auth provider; demo cookie: userId, workspaceId
    const cookieStore = await cookies()
    const ws = cookieStore.get('wsid')?.value
    const uid = cookieStore.get('uid')?.value
    
    // Demo mode: if no cookies, use demo user
    if (!uid || !ws) {
      // Check if we're in demo mode by looking for demo workspace
      const demoWorkspace = await prisma.workspace.findUnique({
        where: { slug: 'demo-workspace' }
      })
      
      if (demoWorkspace) {
        // Find membership for demo workspace
        const membership = await prisma.membership.findFirst({
          where: { workspaceId: demoWorkspace.id },
          include: { user: true }
        })
        
        if (membership) {
          const role = membership.role.toLowerCase() as AppRole
          return {
            id: membership.user.id,
            email: membership.user.email || 'demo@branddeals.test',
            role,
            workspaceId: demoWorkspace.id
          }
        }
      }
      
      return null
    }

    const m = await prisma.membership.findUnique({
      where: { userId_workspaceId: { userId: uid, workspaceId: ws } },
      select: { role: true, workspaceId: true, user: { select: { id: true, email: true } } }
    })
    if (!m) return null

    const role = m.role.toLowerCase() as AppRole
    return { id: m.user.id, email: m.user.email, role, workspaceId: m.workspaceId }
  } catch (error) {
    console.error('getCurrentUser error:', error)
    return null
  }
}

export async function requireRole(min: AppRole) {
  const u = await getCurrentUser()
  if (!u) throw new Error('UNAUTHENTICATED')
  if (!u.role) throw new Error('FORBIDDEN')
  const ok = (['owner','admin','member','viewer'] as AppRole[]).includes(u.role) && 
             ( (u.role === 'owner' && ['owner','admin','member','viewer']) || true)
  if (!ok) throw new Error('FORBIDDEN')
  return u
}
