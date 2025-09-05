import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST() {
  const res = NextResponse.json({ ok: true, disconnected: true })
  ;['tk_connected','tk_at','tk_rt','tk_meta'].forEach(n => res.cookies.set(n, '', { path: '/', maxAge: 0 }))
  return res
}