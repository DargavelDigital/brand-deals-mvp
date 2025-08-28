import { NextRequest, NextResponse } from 'next/server'
import { buildSnapshot } from '@/services/social/snapshot.aggregator'

// GET /api/social/snapshot?workspaceId=...&yt=CHANNEL_ID
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const workspaceId = searchParams.get('workspaceId') ?? 'demo-workspace'
  const yt = searchParams.get('yt') ?? undefined
  const snap = await buildSnapshot({
    workspaceId,
    youtube: yt ? { channelId: yt } : undefined,
  })
  return NextResponse.json({ snapshot: snap })
}
