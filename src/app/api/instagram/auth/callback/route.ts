import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    {
      error: 'NOT_IMPLEMENTED',
      message: 'Instagram integration is not yet implemented',
      service: 'instagram',
      status: 'coming_soon'
    },
    { status: 501 }
  )
}
