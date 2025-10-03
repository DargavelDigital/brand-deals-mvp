import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { packId, payload, theme } = await req.json()
    if (!packId || !payload) {
      return NextResponse.json({ ok: false, error: "packId and payload required" }, { status: 400 })
    }
    await prisma().mediaPack.upsert({
      where: { id: packId },
      update: { payload, theme: theme || null },
      create: { id: packId, payload, theme: theme || null },
    })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}
