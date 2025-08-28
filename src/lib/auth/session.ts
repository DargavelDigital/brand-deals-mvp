import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import type { AppRole, SessionUser } from './types'

export async function getCurrentUser(): Promise<SessionUser | null> {
  // Replace with your auth provider; demo cookie: userId, workspaceId
  const ws = cookies().get('wsid')?.value
  const uid = cookies().get('uid')?.value
  if (!uid || !ws) return null

  const m = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: uid, workspaceId: ws } },
    select: { role: true, workspaceId: true, user: { select: { id: true, email: true } } }
  })
  if (!m) return null

  const role = m.role.toLowerCase() as AppRole
  return { id: m.user.id, email: m.user.email, role, workspaceId: m.workspaceId }
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
