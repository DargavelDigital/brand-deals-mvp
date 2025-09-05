import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

export async function GET() {
  const jar = Object.fromEntries(cookies().getAll().map(c => [c.name, c.value]))
  return NextResponse.json({ ok: true, cookies: jar })
}
