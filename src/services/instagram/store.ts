import { cookies } from 'next/headers'

/** Adapter tries DB schema first; falls back to encrypted cookie for dev. */
export type IgConn = {
  workspaceId: string
  userAccessToken: string       // long-lived
  pageId: string
  igUserId: string
  username?: string
  expiresAt?: string            // ISO (optional)
}

export async function saveIgConnection(conn: IgConn) {
  // Store connection in cookies (database integration not yet implemented)
  const cookieStore = await cookies()
  cookieStore.set('ig_conn', JSON.stringify(conn), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60*60*24*30 })
}

export async function loadIgConnection(workspaceId: string): Promise<IgConn | null> {
  // Load connection from cookies (database integration not yet implemented)
  const cookieStore = await cookies()
  const c = cookieStore.get('ig_conn')?.value
  if (!c) return null
  try {
    const v = JSON.parse(c)
    return v?.workspaceId === workspaceId ? v : null
  } catch { return null }
}

export async function deleteIgConnection(workspaceId: string) {
  // Delete connection from cookies (database integration not yet implemented)
  const cookieStore = await cookies()
  cookieStore.delete('ig_conn')
}
