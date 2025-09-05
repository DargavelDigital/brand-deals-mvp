import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const connected = cookies().get('tk_connected')?.value === '1'
  return NextResponse.json({ ok: true, connected })
}
