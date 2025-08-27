import { cookies } from 'next/headers'

export type LinkedInConn = {
  workspaceId: string
  accessToken: string
  refreshToken?: string
  orgUrn?: string
  orgId?: string
  orgName?: string
  expiresAt?: string
}

export async function saveLinkedInConnection(conn: LinkedInConn){
  // Store connection in cookies (database integration not yet implemented)
  cookies().set('li_conn', JSON.stringify(conn), { httpOnly:true, secure:true, sameSite:'lax', path:'/', maxAge:60*60*24*30 })
}

export async function loadLinkedInConnection(workspaceId: string): Promise<LinkedInConn|null>{
  // Load connection from cookies (database integration not yet implemented)
  const c = cookies().get('li_conn')?.value
  if (!c) return null
  try { const v = JSON.parse(c); return v?.workspaceId === workspaceId ? v : null } catch { return null }
}

export async function deleteLinkedInConnection(workspaceId: string){
  // Delete connection from cookies (database integration not yet implemented)
  cookies().delete('li_conn')
}
