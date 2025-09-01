import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    {
      error: 'NOT_IMPLEMENTED',
      message: 'TikTok integration is not yet implemented',
      service: 'tiktok',
      status: 'coming_soon'
    },
    { status: 501 }
  )
}
