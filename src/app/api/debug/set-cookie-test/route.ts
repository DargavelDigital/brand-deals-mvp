import { NextResponse } from 'next/server'

// Prefer POST for "set" operations; GET can also work, but POST avoids accidental caching.
export async function POST() {
  const res = NextResponse.json({ ok: true, set: 'wsid' })
  // Set a test cookie safely
  res.cookies.set('wsid_test', 'ws_test_value', {
    httpOnly: true,     // change to false only if the client must read it
    secure: true,       // required on production HTTPS (which you have)
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60,    // 1 hour
  })
  return res
}

// (Optional) Keep GET but don't mutate the read-only cookies() object.
export async function GET() {
  const res = NextResponse.json({ ok: true, hint: 'Use POST to set cookie' })
  return res
}
