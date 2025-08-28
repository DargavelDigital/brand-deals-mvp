import { NextRequest, NextResponse } from 'next/server'
import { createTopupCheckout } from '@/services/billing'
import { getCurrentUser } from '@/lib/auth/session'

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user?.workspaceId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const lookupKey = body.lookupKey as string
  if (!lookupKey) return NextResponse.json({ error: 'lookupKey required' }, { status: 400 })
  const url = await createTopupCheckout(user.workspaceId, lookupKey)
  return NextResponse.json({ url })
}
