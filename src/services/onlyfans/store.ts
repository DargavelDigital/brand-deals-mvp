import { cookies } from 'next/headers'

export type OnlyFansConn = {
  workspaceId: string
  accessToken: string
  refreshToken?: string
  userId?: string
  username?: string
  expiresAt?: string
}

export async function saveOnlyFansConnection(conn: OnlyFansConn) {
  // Store connection in cookies (database integration not yet implemented)
  cookies().set('of_conn', JSON.stringify(conn), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60*60*24*30 })
}

export async function loadOnlyFansConnection(workspaceId: string): Promise<OnlyFansConn | null> {
  // Load connection from cookies (database integration not yet implemented)
  const c = cookies().get('of_conn')?.value
  if (!c) return null
  try {
    const v = JSON.parse(c)
    return v?.workspaceId === workspaceId ? v : null
  } catch { return null }
}

export async function deleteOnlyFansConnection(workspaceId: string) {
  // Delete connection from cookies (database integration not yet implemented)
  cookies().delete('of_conn')
}
