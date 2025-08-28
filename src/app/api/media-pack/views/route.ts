import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error:'id required' }, { status:400 })
  const count = await prisma.mediaPackView.count({ where: { mediaPackId: id } })
  return NextResponse.json({ id, views: count })
}
