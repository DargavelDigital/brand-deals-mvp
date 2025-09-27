import { NextResponse } from 'next/server'
import { socials, COMING_SOON_MSG } from '@/config/socials'

function comingSoon() {
  return NextResponse.json({ ok: false, code: 'COMING_SOON', message: COMING_SOON_MSG }, { status: 501 })
}

export async function GET() {
  if (!socials.enabled('x')) return comingSoon()
  
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
