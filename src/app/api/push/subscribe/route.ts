import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'NOT_IMPLEMENTED',
      message: 'Push notifications are not yet implemented',
      service: 'push',
      status: 'coming_soon'
    },
    { status: 501 }
  )
}
