import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import type { AppRole, SessionUser } from './types'
import { roleAtLeast } from './types'

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

    // Map database roles to app roles
    let appRole: AppRole
    switch (m.role) {
      case 'OWNER':
        appRole = 'owner'
        break
      case 'MANAGER':
        appRole = 'manager'
        break
      case 'MEMBER':
        appRole = 'member'
        break
      case 'VIEWER':
        appRole = 'viewer'
        break
      default:
        appRole = 'viewer' // fallback
    }
    
    return { id: m.user.id, email: m.user.email, role: appRole, workspaceId: m.workspaceId }
  } catch (error) {
    console.error('getCurrentUser error:', error)
    return null
  }
}

export async function requireRole(min: AppRole) {
  const u = await getCurrentUser()
  if (!u) throw new Error('UNAUTHENTICATED')
  if (!u.role) throw new Error('FORBIDDEN')
  
  // Check if user has at least the minimum required role
  const ok = roleAtLeast(u.role, min)
  if (!ok) throw new Error('FORBIDDEN')
  
  return u
}

export async function requireRoleIn(roles: AppRole[]) {
  const u = await getCurrentUser()
  if (!u) throw new Error('UNAUTHENTICATED')
  if (!u.role) throw new Error('FORBIDDEN')
  
  // Check if user has one of the required roles
  const ok = roles.includes(u.role)
  if (!ok) throw new Error('FORBIDDEN')
  
  return u
}
