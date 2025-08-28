import { NextRequest, NextResponse } from 'next/server'
import { roleAtLeast, type AppRole } from './types'
import { getCurrentUser } from './session'

export function rbac(min: AppRole, opts?: { workspaceParam?: string }) {
  return async (req: NextRequest) => {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

    // optional: verify route workspace matches user's
    const wsParam = opts?.workspaceParam
    if (wsParam) {
      const url = new URL(req.url)
      const w = url.searchParams.get(wsParam)
      if (w && user.workspaceId && w !== user.workspaceId) {
        return NextResponse.json({ error: 'forbidden' }, { status: 403 })
      }
    }

    if (!user.role || !roleAtLeast(user.role, min)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    // attach context for handlers
    ;(req as any).user = user
    return null
  }
}

export function withGuard(min: AppRole, handler: (req: NextRequest) => Promise<Response>, opts?: { workspaceParam?: string }) {
  return async (req: NextRequest) => {
    const gate = await rbac(min, opts)(req)
    if (gate) return gate
    return handler(req)
  }
}
