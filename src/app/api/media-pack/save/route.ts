import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { packId, payload, theme } = await req.json()
    if (!packId || !payload) {
      return NextResponse.json({ ok: false, error: "packId and payload required" }, { status: 400 })
    }
    // First ensure we have a demo workspace
    const workspace = await prisma().workspace.upsert({
      where: { id: "demo-workspace" },
      update: {},
      create: {
        id: "demo-workspace",
        name: "Demo Workspace",
        slug: "demo-workspace",
      },
    });

    await prisma().mediaPack.upsert({
      where: { id: packId },
      update: { 
        payload, 
        theme: theme || null,
        updatedAt: new Date()
      },
      create: { 
        id: packId, 
        payload, 
        theme: theme || null,
        workspaceId: workspace.id,
        creatorId: "demo-creator", // TODO: Get from session
        demo: true
      },
    })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}
