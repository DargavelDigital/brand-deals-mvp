import { cookies } from 'next/headers'

export type TikTokConn = {
  workspaceId: string
  accessToken: string
  refreshToken?: string
  userId?: string
  username?: string
  expiresAt?: string
}

export async function saveTikTokConnection(conn: TikTokConn) {
  // Store connection in cookies (database integration not yet implemented)
  cookies().set('tt_conn', JSON.stringify(conn), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60*60*24*30 })
}

export async function loadTikTokConnection(workspaceId: string): Promise<TikTokConn | null> {
  // Load connection from cookies (database integration not yet implemented)
  const c = cookies().get('tt_conn')?.value
  if (!c) return null
  try {
    const v = JSON.parse(c)
    return v?.workspaceId === workspaceId ? v : null
  } catch { return null }
}

export async function deleteTikTokConnection(workspaceId: string) {
  // Delete connection from cookies (database integration not yet implemented)
  cookies().delete('tt_conn')
}
