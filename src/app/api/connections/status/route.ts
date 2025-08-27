export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { getAllConnectionStatus } from '@/services/connections/status'

export async function GET() {
  const list = await getAllConnectionStatus()
  return NextResponse.json(list)
}
