import { cookies } from 'next/headers'
import { createHash } from 'crypto'

export function hashToken(t: string) {
  return createHash('sha256').update(t).digest('hex')
}

export async function startImpersonation(adminId: string, workspaceId: string, reason?: string) {
  const { prisma } = await import('@/lib/prisma');
  const token = crypto.randomUUID()
  const tokenHash = hashToken(token)
  await prisma().impersonationSession.create({ data: { adminId, workspaceId, tokenHash, reason } })
  const cookieStore = await cookies()
  cookieStore.set('impersonate', `${workspaceId}.${token}`, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 })
  return { token }
}

export async function endImpersonation() {
  const { prisma } = await import('@/lib/prisma');
  const cookieStore = await cookies()
  const c = cookieStore.get('impersonate')?.value
  if (!c) return
  const [workspaceId, token] = c.split('.')
  await prisma().impersonationSession.updateMany({
    where: { workspaceId, tokenHash: hashToken(token), active: true },
    data: { active: false, endedAt: new Date() },
  })
  cookieStore.delete('impersonate')
}

export async function getImpersonatedWorkspaceId(): Promise<string | null> {
  const cookieStore = await cookies()
  const v = cookieStore.get('impersonate')?.value
  if (!v) return null
  const [workspaceId, token] = v.split('.')
  const ok = await prisma().impersonationSession.findFirst({
    where: { workspaceId, tokenHash: hashToken(token), active: true },
    select: { id: true },
  })
  return ok ? workspaceId : null
}
