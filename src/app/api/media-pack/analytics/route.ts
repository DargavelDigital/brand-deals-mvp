import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(req: Request) {

  const url = new URL(req.url)
  const mediaPackId = url.searchParams.get('mediaPackId') || ''
  if (!mediaPackId) return NextResponse.json({ ok:false, error:'BAD_REQUEST' }, { status:400 })

  const [summary, perVariant, series] = await Promise.all([
    Promise.all([
      prisma.mediaPackView.count({ where: { mediaPackId } }),
      prisma.mediaPackClick.count({ where: { mediaPackId } }),
      prisma.mediaPackConversion.count({ where: { mediaPackId } })
    ]),
    // For now, return empty array since MediaPackDaily might not exist yet
    Promise.resolve([]),
    // For now, return empty array since MediaPackDaily might not exist yet
    Promise.resolve([])
  ])

  const [views, clicks, conversions] = summary
  const totals = { 
    views: views || 0, 
    clicks: clicks || 0, 
    conversions: conversions || 0,
    ctr: views ? clicks / views : 0, 
    cvr: views ? conversions / views : 0 
  }

  return NextResponse.json({
    ok: true,
    summary: totals,
    variants: [], // Empty for now until MediaPackDaily is populated
    series: []    // Empty for now until MediaPackDaily is populated
  })
}
