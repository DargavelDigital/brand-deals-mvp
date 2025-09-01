import { NextRequest, NextResponse } from 'next/server'
import { createTopupCheckout } from '@/services/billing'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'

export async function POST(req: NextRequest) {
  try {
    const { workspaceId } = await requireSessionOrDemo(req)
    const body = await req.json().catch(() => ({}))
    const lookupKey = body.lookupKey as string
    if (!lookupKey) return NextResponse.json({ error: 'lookupKey required' }, { status: 400 })
    
    const url = await createTopupCheckout(workspaceId, lookupKey)
    return NextResponse.json({ url })
  } catch (error) {
    if (error instanceof Response) throw error
    return NextResponse.json({ error: 'internal server error' }, { status: 500 })
  }
}
