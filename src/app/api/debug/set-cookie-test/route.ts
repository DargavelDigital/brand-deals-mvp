import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

export async function GET() {
  const res = NextResponse.redirect('/api/debug/read-cookies')
  res.cookies.set('debug_cookie', '1', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 5,
  })
  return res
}
