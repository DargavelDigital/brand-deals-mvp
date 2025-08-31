import { env } from './env'

export type SessionCtx = { userId: string; workspaceId: string }

export function allowDemoOrThrow(req: Request) {
  const demo = env.DEMO_MODE === '1' || env.DEMO_MODE === 'true'
  if (demo) return { userId: 'demo-user', workspaceId: 'demo-workspace' }
  throw new Response('Unauthorized', { status: 401 })
}

export async function requireSessionOrDemo(_req: Request): Promise<SessionCtx> {
  // TODO: Replace with real session lookup (NextAuth) when ready
  const demo = env.DEMO_MODE === '1' || env.DEMO_MODE === 'true'
  if (demo) return { userId: 'demo-user', workspaceId: 'demo-workspace' }
  // If using NextAuth, e.g.
  // const session = await auth()
  // if (session?.user?.id && session.user.workspaceId) {
  //   return { userId: session.user.id, workspaceId: session.user.workspaceId }
  // }
  throw new Response('Unauthorized', { status: 401 })
}
