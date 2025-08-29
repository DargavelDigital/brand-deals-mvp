import { NextRequest, NextResponse } from 'next/server'
import { createPortalSession } from '@/services/billing'
import { requireSessionOrDemo } from '@/lib/authz'

export async function POST(req: NextRequest) {
  try {
    const { workspaceId } = await requireSessionOrDemo(req)
    const url = await createPortalSession(workspaceId)
    return NextResponse.json({ url })
  } catch (error) {
    if (error instanceof Response) throw error
    return NextResponse.json({ error: 'internal server error' }, { status: 500 })
  }
}
