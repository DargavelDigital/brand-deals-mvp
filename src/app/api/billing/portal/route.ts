import { NextRequest, NextResponse } from 'next/server'
import { createPortalSession } from '@/services/billing'
import { getCurrentUser } from '@/lib/auth/session'

export async function POST() {
  const user = await getCurrentUser()
  if (!user?.workspaceId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  const url = await createPortalSession(user.workspaceId)
  return NextResponse.json({ url })
}
