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
  try {
    // Try drizzle schema.social_accounts if present
    const { db } = await import('@/src/db/client').catch(()=>({} as any))
    const schema = await import('@/src/db/schema').catch(()=> ({} as any))
    // @ts-ignore
    if (db && schema?.socialAccounts) {
      // @ts-ignore
      const { socialAccounts } = schema
      // @ts-ignore minimal upsert; adapt to your schema column names
      await db.insert(socialAccounts).values({
        provider: 'instagram',
        workspaceId: conn.workspaceId,
        externalId: conn.igUserId,
        username: conn.username ?? null,
        accessToken: conn.userAccessToken,
        pageId: conn.pageId,
        meta: { expiresAt: conn.expiresAt }
      }).onConflictDoUpdate?.({
        target: [socialAccounts.provider, socialAccounts.workspaceId],
        set: {
          externalId: conn.igUserId,
          username: conn.username ?? null,
          accessToken: conn.userAccessToken,
          pageId: conn.pageId,
          meta: { expiresAt: conn.expiresAt }
        }
      })
      return
    }
  } catch {}
  // Dev fallback: cookie (short-term)
  cookies().set('ig_conn', JSON.stringify(conn), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60*60*24*30 })
}

export async function loadIgConnection(workspaceId: string): Promise<IgConn | null> {
  try {
    const { db } = await import('@/src/db/client').catch(()=>({} as any))
    const schema = await import('@/src/db/schema').catch(()=> ({} as any))
    // @ts-ignore
    if (db && schema?.socialAccounts) {
      // @ts-ignore
      const { socialAccounts } = schema
      const { eq } = await import('drizzle-orm').catch(()=> ({} as any))
      // @ts-ignore
      const rows = await db.select().from(socialAccounts).where(eq(socialAccounts.workspaceId, workspaceId)).limit(1)
      return rows?.[0] ?? null
    }
  } catch {}
  const c = cookies().get('ig_conn')?.value
  if (!c) return null
  try {
    const v = JSON.parse(c)
    return v?.workspaceId === workspaceId ? v : null
  } catch { return null }
}

export async function deleteIgConnection(workspaceId: string) {
  try {
    const { db } = await import('@/src/db/client').catch(()=>({} as any))
    const schema = await import('@/src/db/schema').catch(()=> ({} as any))
    // @ts-ignore
    if (db && schema?.socialAccounts) {
      // @ts-ignore
      const { socialAccounts } = schema
      const { eq } = await import('drizzle-orm').catch(()=> ({} as any))
      // @ts-ignore
      await db.delete(socialAccounts).where(eq(socialAccounts.workspaceId, workspaceId))
      return
    }
  } catch {}
  cookies().delete('ig_conn')
}
