import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    {
      error: 'NOT_IMPLEMENTED',
      message: 'X (Twitter) integration is not yet implemented',
      service: 'x',
      status: 'coming_soon'
    },
    { status: 501 }
  )
}
