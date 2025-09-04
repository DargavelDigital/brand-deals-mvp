import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  
  // Clear token cookies
  response.cookies.delete('tiktok_token')
  response.cookies.delete('tiktok_conn')
  
  return response
}
