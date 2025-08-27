import { cookies } from 'next/headers'

export type XConn = {
  workspaceId: string
  accessToken: string
  refreshToken?: string
  userId?: string
  username?: string
  expiresAt?: string
}

export async function saveXConnection(conn: XConn) {
  // Store connection in cookies (database integration not yet implemented)
  cookies().set('x_conn', JSON.stringify(conn), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60*60*24*30 })
}

export async function loadXConnection(workspaceId: string): Promise<XConn | null> {
  // Load connection from cookies (database integration not yet implemented)
  const c = cookies().get('x_conn')?.value
  if (!c) return null
  try {
    const v = JSON.parse(c)
    return v?.workspaceId === workspaceId ? v : null
  } catch { return null }
}

export async function deleteXConnection(workspaceId: string) {
  // Delete connection from cookies (database integration not yet implemented)
  cookies().delete('x_conn')
}
