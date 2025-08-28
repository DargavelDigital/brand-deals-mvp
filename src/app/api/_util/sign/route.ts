import { NextRequest, NextResponse } from 'next/server'
import { signPayload } from '@/lib/signing'

export async function POST(req: NextRequest) {
  const data = await req.text()
  const json = data ? JSON.parse(data) : {}
  const t = signPayload(json, '10m')
  return NextResponse.json({ t })
}
