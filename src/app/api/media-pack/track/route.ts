import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import crypto from 'node:crypto'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const mp = req.nextUrl.searchParams.get('mp')
    const t  = req.nextUrl.searchParams.get('t') || nanoid()
    if (!mp) return tinyGif()

    const ip = req.ip ?? req.headers.get('x-forwarded-for') ?? ''
    const ipHash = ip ? crypto.createHash('sha256').update(ip).digest('hex') : null
    const ua = req.headers.get('user-agent') ?? undefined

    await prisma.mediaPackView.create({
      data: {
        mediaPackId: mp,
        traceId: String(t),
        ipHash: ipHash || undefined,
        userAgent: ua,
      }
    })
    return tinyGif()
  } catch {
    return tinyGif()
  }
}

function tinyGif() {
  const body = Buffer.from(
    "47494638396101000100910000ffffff00000021f90401000001002c00000000010001000002024401003b",
    "hex"
  )
  return new NextResponse(body, { headers: { 'Content-Type': 'image/gif', 'Content-Length': body.length.toString(), 'Cache-Control':'no-store' }})
}
