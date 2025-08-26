import { cookies } from 'next/headers'
import { OfConn } from './types'

export async function saveOfConnection(conn: OfConn){
  try {
    const { db } = await import('@/src/db/client').catch(()=>({} as any))
    const schema = await import('@/src/db/schema').catch(()=> ({} as any))
    // @ts-ignore
    if (db && schema?.socialAccounts){
      // @ts-ignore
      const { socialAccounts } = schema
      await db.insert(socialAccounts).values({
        provider: 'onlyfans',
        workspaceId: conn.workspaceId,
        externalId: conn.accountId || null,
        username: conn.username || null,
        accessToken: conn.accessToken || null,
        refreshToken: conn.refreshToken || null,
        meta: { provider: conn.provider, expiresAt: conn.expiresAt }
      }).onConflictDoUpdate?.({
        target: [socialAccounts.provider, socialAccounts.workspaceId],
        set: {
          externalId: conn.accountId || null,
          username: conn.username || null,
          accessToken: conn.accessToken || null,
          refreshToken: conn.refreshToken || null,
          meta: { provider: conn.provider, expiresAt: conn.expiresAt }
        }
      })
      return
    }
  } catch {}
  cookies().set('of_conn', JSON.stringify(conn), { httpOnly:true, secure:true, sameSite:'lax', path:'/', maxAge:60*60*24*30 })
}

export async function loadOfConnection(workspaceId: string): Promise<OfConn|null>{
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
  const c = cookies().get('of_conn')?.value
  if (!c) return null
  try { const v = JSON.parse(c); return v?.workspaceId === workspaceId ? v : null } catch { return null }
}

export async function deleteOfConnection(workspaceId: string){
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
  cookies().delete('of_conn')
}
