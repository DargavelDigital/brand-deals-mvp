import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export async function GET() {
  const engineType = process.env.PRISMA_QUERY_ENGINE_TYPE || null
  const dataproxy = process.env.PRISMA_GENERATE_DATAPROXY || null
  return NextResponse.json({ ok: true, nodeEnv: process.env.NODE_ENV, engineType, dataproxy })
}
