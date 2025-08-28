import { NextRequest, NextResponse } from 'next/server'
import { withGuard } from '@/lib/auth/guard'
import { purgeDeletedOlderThan } from '@/services/retention'

export const POST = withGuard('owner', async () => {
  const count = await purgeDeletedOlderThan(30)
  return NextResponse.json({ purged: count })
})
