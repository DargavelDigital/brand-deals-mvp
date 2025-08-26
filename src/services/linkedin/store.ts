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
  try {
    const { db } = await import('@/src/db/client').catch(()=>({} as any))
    const schema = await import('@/src/db/schema').catch(()=> ({} as any))
    // @ts-ignore
    if (db && schema?.socialAccounts){
      // @ts-ignore
      const { socialAccounts } = schema
      await db.insert(socialAccounts).values({
        provider: 'linkedin',
        workspaceId: conn.workspaceId,
        externalId: conn.orgId || null,
        username: conn.orgName || null,
        accessToken: conn.accessToken,
        refreshToken: conn.refreshToken || null,
        meta: { orgUrn: conn.orgUrn, expiresAt: conn.expiresAt }
      }).onConflictDoUpdate?.({
        target: [socialAccounts.provider, socialAccounts.workspaceId],
        set: {
          externalId: conn.orgId || null,
          username: conn.orgName || null,
          accessToken: conn.accessToken,
          refreshToken: conn.refreshToken || null,
          meta: { orgUrn: conn.orgUrn, expiresAt: conn.expiresAt }
        }
      })
      return
    }
  } catch {}
  cookies().set('li_conn', JSON.stringify(conn), { httpOnly:true, secure:true, sameSite:'lax', path:'/', maxAge:60*60*24*30 })
}

export async function loadLinkedInConnection(workspaceId: string): Promise<LinkedInConn|null>{
  try {
    const { db } = await import('@/src/db/client').catch(()=>({} as any))
    const schema = await import('@/src/db/schema').catch(()=> ({} as any))
    // @ts-ignore
    if (db && schema?.socialAccounts){
      // @ts-ignore
      const { socialAccounts } = schema
      const { eq } = await import('drizzle-orm').catch(()=> ({} as any))
      // @ts-ignore
      const rows = await db.select().from(socialAccounts).where(eq(socialAccounts.workspaceId, workspaceId)).limit(1)
      return rows?.[0] ?? null
    }
  } catch {}
  const c = cookies().get('li_conn')?.value
  if (!c) return null
  try { const v = JSON.parse(c); return v?.workspaceId === workspaceId ? v : null } catch { return null }
}

export async function deleteLinkedInConnection(workspaceId: string){
  try {
    const { db } = await import('@/src/db/client').catch(()=>({} as any))
    const schema = await import('@/src/db/schema').catch(()=> ({} as any))
    // @ts-ignore
    if (db && schema?.socialAccounts){
      // @ts-ignore
      const { socialAccounts } = schema
      const { eq } = await import('drizzle-orm').catch(()=> ({} as any))
      // @ts-ignore
      await db.delete(socialAccounts).where(eq(socialAccounts.workspaceId, workspaceId))
      return
    }
  } catch {}
  cookies().delete('li_conn')
}
