import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const c = cookies()
  ;['tk_connected','tk_at','tk_rt','tk_meta'].forEach(n => c.set(n, '', { path: '/', maxAge: 0 }))
  return NextResponse.json({ ok: true, disconnected: true })
}