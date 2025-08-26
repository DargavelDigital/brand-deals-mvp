import { cookies } from 'next/headers'

export async function ensureWorkspace(): Promise<string> {
  const c = cookies()
  const ws = c.get('wsid')?.value
  if (ws) return ws
  const gen = 'ws_' + Math.random().toString(36).slice(2,10)
  c.set('wsid', gen, { httpOnly:true, sameSite:'lax', secure:true, path:'/', maxAge:60*60*24*365 })
  return gen
}

export async function currentWorkspaceId(): Promise<string|null> {
  return cookies().get('wsid')?.value ?? null
}
